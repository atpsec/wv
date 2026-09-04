import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const DEFAULT_BYTES = 1 * 1024 * 1024;

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(`speed:${clientIp}`, 12, 60_000)) return rateLimitResponse();
  const requested = Number(new URL(request.url).searchParams.get("bytes"));
  const bytes = Number.isFinite(requested) ? Math.min(Math.max(Math.floor(requested), 64 * 1024), MAX_BYTES) : DEFAULT_BYTES;
  const payload = Buffer.alloc(bytes, 97);
  return new Response(payload, {
    headers: { "Content-Type": "application/octet-stream", "Content-Length": String(bytes), "Cache-Control": "no-store", "X-Speed-Test-Bytes": String(bytes) }
  });
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(`speed:${clientIp}`, 12, 60_000)) return rateLimitResponse();
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BYTES) return Response.json({ error: "Test verisi çok büyük." }, { status: 413 });
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return Response.json({ error: "Test verisi çok büyük." }, { status: 413 });
  return Response.json({ bytes: body.byteLength }, { headers: { "Cache-Control": "no-store" } });
}
