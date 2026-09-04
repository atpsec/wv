import { loginUser } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`login:${ip}`, 10, 60_000)) return rateLimitResponse();
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const user = await loginUser(body.email || "", body.password || "");
    return Response.json({ user });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Giriş sırasında bir hata oluştu." }, { status: 401 });
  }
}
