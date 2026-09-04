import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type UserRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash?: string;
  passwordSalt?: string;
  googleSub?: string;
  authProvider?: "password" | "google";
  createdAt: string;
};

export type SessionRecord = {
  tokenHash: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
};

type Collections = { users: UserRecord[]; sessions: SessionRecord[] };
const fileStore = new Map<keyof Collections, unknown>();
let fileQueue = Promise.resolve();

function hasUpstash(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function upstash(command: string[]): Promise<unknown> {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN!}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Kalıcı veri deposuna erişilemedi.");
  const payload = (await response.json()) as { result?: unknown };
  return payload.result;
}

function dataDirectory(): string {
  const configured = process.env.DATA_DIR;
  return configured ? path.resolve(/*turbopackIgnore: true*/ configured) : path.join(process.cwd(), "data");
}

async function readFileCollection<K extends keyof Collections>(key: K): Promise<Collections[K]> {
  const cached = fileStore.get(key) as Collections[K] | undefined;
  if (cached) return cached;
  const filePath = path.join(dataDirectory(), `${key}.json`);
  try {
    const value = JSON.parse(await readFile(filePath, "utf8")) as Collections[K];
    fileStore.set(key, value);
    return value;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const empty = [] as unknown as Collections[K];
    fileStore.set(key, empty);
    return empty;
  }
}

async function writeFileCollection<K extends keyof Collections>(key: K, value: Collections[K]): Promise<void> {
  await mkdir(dataDirectory(), { recursive: true });
  const filePath = path.join(dataDirectory(), `${key}.json`);
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(value, null, 2), "utf8");
  await rename(temporaryPath, filePath);
  fileStore.set(key, value);
}

export async function getCollection<K extends keyof Collections>(key: K): Promise<Collections[K]> {
  if (hasUpstash()) {
    const value = await upstash(["GET", `atpaivideo:${key}`]);
    return value ? (JSON.parse(value as string) as Collections[K]) : ([] as unknown as Collections[K]);
  }
  return readFileCollection(key);
}

export async function updateCollection<K extends keyof Collections, R>(
  key: K,
  update: (current: Collections[K]) => { value: Collections[K]; result: R } | Promise<{ value: Collections[K]; result: R }>
): Promise<R> {
  if (hasUpstash()) {
    const current = await getCollection(key);
    const next = await update(current);
    await setCollection(key, next.value);
    return next.result;
  }
  let result!: R;
  fileQueue = fileQueue.then(async () => {
    const current = await readFileCollection(key);
    const next = await update(current);
    result = next.result;
    await writeFileCollection(key, next.value);
  });
  await fileQueue;
  return result;
}

export async function setCollection<K extends keyof Collections>(key: K, value: Collections[K]): Promise<void> {
  if (hasUpstash()) {
    await upstash(["SET", `atpaivideo:${key}`, JSON.stringify(value)]);
    return;
  }
  fileQueue = fileQueue.then(() => writeFileCollection(key, value));
  await fileQueue;
}
