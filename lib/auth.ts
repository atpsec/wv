import { cookies } from "next/headers";
import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getCollection, type SessionRecord, type UserRecord, updateCollection } from "@/lib/store";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "atp_session";
const SESSION_DAYS = 30;
export type PublicUser = Pick<UserRecord, "id" | "email" | "username" | "createdAt">;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("SESSION_SECRET üretimde en az 32 karakter olmalıdır.");
  }
  return secret || "development-only-change-me";
}

export function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }

export function validateCredentials(email: string, password: string, username?: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Geçerli bir e-posta adresi girin.";
  if (password.length < 8 || password.length > 128) return "Şifre 8–128 karakter arasında olmalıdır.";
  if (username !== undefined && (username.trim().length < 2 || username.trim().length > 32)) return "Kullanıcı adı 2–32 karakter arasında olmalıdır.";
  return null;
}

async function hashPassword(password: string, salt = randomBytes(16).toString("hex")): Promise<{ hash: string; salt: string }> {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return { hash: derived.toString("hex"), salt };
}

async function passwordsMatch(password: string, user: UserRecord): Promise<boolean> {
  if (!user.passwordHash || !user.passwordSalt) return false;
  const candidate = await hashPassword(password, user.passwordSalt);
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = Buffer.from(candidate.hash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function tokenHash(token: string): string { return createHash("sha256").update(`${sessionSecret()}:${token}`).digest("hex"); }
function publicUser(user: UserRecord): PublicUser { return { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt }; }

export async function registerUser(emailInput: string, password: string, usernameInput: string): Promise<PublicUser> {
  const email = normalizeEmail(emailInput);
  const username = usernameInput.trim();
  const validationError = validateCredentials(email, password, username);
  if (validationError) throw new Error(validationError);
  const user = await updateCollection("users", async (users) => {
    if (users.some((item) => item.email === email)) throw new Error("Bu e-posta adresiyle zaten bir hesap var.");
    const passwordData = await hashPassword(password);
    const created: UserRecord = { id: randomUUID(), email, username, passwordHash: passwordData.hash, passwordSalt: passwordData.salt, createdAt: new Date().toISOString() };
    return { value: [...users, created], result: created };
  });
  await createSession(user.id);
  return publicUser(user);
}

export async function loginUser(emailInput: string, password: string): Promise<PublicUser> {
  const email = normalizeEmail(emailInput);
  if (!email || !password) throw new Error("E-posta ve şifre alanlarını doldurun.");
  const users = await getCollection("users");
  const user = users.find((item) => item.email === email);
  if (!user || !(await passwordsMatch(password, user))) throw new Error("E-posta veya şifre hatalı.");
  await createSession(user.id);
  return publicUser(user);
}

function googleUsernameBase(displayName: string, email: string): string {
  const display = displayName.trim().replace(/\s+/g, " ");
  const localPart = email.split("@", 1)[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || "google-user";
  return (display || localPart).slice(0, 32);
}

function uniqueGoogleUsername(users: UserRecord[], displayName: string, email: string): string {
  const base = googleUsernameBase(displayName, email) || "google-user";
  const taken = new Set(users.map((item) => item.username.trim().toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  for (let counter = 2; counter < 1000; counter += 1) {
    const suffix = ` ${counter}`;
    const candidate = `${base.slice(0, 32 - suffix.length)}${suffix}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return `google-${randomBytes(6).toString("hex")}`;
}

export async function upsertGoogleUser(input: { sub: string; email: string; displayName: string }): Promise<PublicUser> {
  const email = normalizeEmail(input.email);
  const user = await updateCollection("users", async (users) => {
    const byGoogle = users.find((item) => item.googleSub === input.sub);
    if (byGoogle) return { value: users, result: byGoogle };

    const byEmail = users.find((item) => item.email === email);
    if (byEmail) {
      if (byEmail.googleSub && byEmail.googleSub !== input.sub) throw new Error("Bu e-posta Google hesabıyla eşleşmiyor.");
      const linked = { ...byEmail, googleSub: input.sub };
      return { value: users.map((item) => item.id === byEmail.id ? linked : item), result: linked };
    }

    const created: UserRecord = {
      id: randomUUID(),
      email,
      username: uniqueGoogleUsername(users, input.displayName, email),
      googleSub: input.sub,
      authProvider: "google",
      createdAt: new Date().toISOString()
    };
    return { value: [...users, created], result: created };
  });
  await createSession(user.id);
  return publicUser(user);
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const session: SessionRecord = { tokenHash: tokenHash(token), userId, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString() };
  await updateCollection("sessions", (sessions) => ({ value: [...sessions.filter((item) => new Date(item.expiresAt).getTime() > now), session], result: undefined }));
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 24 * 60 * 60 });
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const currentHash = tokenHash(token);
    await updateCollection("sessions", (sessions) => ({ value: sessions.filter((item) => item.tokenHash !== currentHash), result: undefined }));
  }
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sessions = await getCollection("sessions");
  const session = sessions.find((item) => item.tokenHash === tokenHash(token));
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return null;
  const users = await getCollection("users");
  const user = users.find((item) => item.id === session.userId);
  return user ? publicUser(user) : null;
}
