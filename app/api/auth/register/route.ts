import { registerUser } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`register:${ip}`, 5, 60_000)) return rateLimitResponse();
  try {
    const body = (await request.json()) as { email?: string; password?: string; username?: string };
    if (!body.email || !body.password || !body.username) return Response.json({ error: "Kullanıcı adı, e-posta ve şifre gereklidir." }, { status: 400 });
    const user = await registerUser(body.email, body.password, body.username);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt sırasında bir hata oluştu." }, { status: 400 });
  }
}
