import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(`ip:${clientIp}`, 30, 60_000)) return rateLimitResponse();
  return Response.json(
    { ip: clientIp, source: clientIp === "unknown" ? "Sunucu istemci IP’sini iletmedi" : "HTTP proxy başlıkları" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
