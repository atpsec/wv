import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const GOOGLE_STATE_COOKIE = "atp_google_state";
export const GOOGLE_VERIFIER_COOKIE = "atp_google_verifier";
const GOOGLE_COOKIE_MAX_AGE = 10 * 60;

export type GoogleErrorCode =
  | "not_configured"
  | "cancelled"
  | "invalid_state"
  | "provider_error"
  | "invalid_account"
  | "rate_limited";

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  const origin = new URL(request.url).origin;
  return origin.replace("://0.0.0.0", "://localhost");
}

export function googleRedirectUri(request: Request): string {
  return process.env.GOOGLE_REDIRECT_URI?.trim() || `${siteOrigin(request)}/api/auth/google/callback`;
}

export function googleErrorRedirect(request: Request, code: GoogleErrorCode): Response {
  const url = new URL(siteOrigin(request));
  url.searchParams.set("google_error", code);
  return Response.redirect(url, 302);
}

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function stateMatches(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function setGoogleFlowCookies(state: string, verifier: string): Promise<void> {
  const cookieStore = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: GOOGLE_COOKIE_MAX_AGE };
  cookieStore.set(GOOGLE_STATE_COOKIE, state, options);
  cookieStore.set(GOOGLE_VERIFIER_COOKIE, verifier, options);
}

export async function clearGoogleFlowCookies(): Promise<void> {
  const cookieStore = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 0 };
  cookieStore.set(GOOGLE_STATE_COOKIE, "", options);
  cookieStore.set(GOOGLE_VERIFIER_COOKIE, "", options);
}
