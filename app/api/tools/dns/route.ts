import dns from "node:dns/promises";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

type ResolverResult = { resolver: string; answers: Record<string, string[]>; latencyMs: number; error?: string };
const targets = ["example.com", "cloudflare.com", "google.com"];

async function testResolver(name: string, servers?: string[]): Promise<ResolverResult> {
  const resolver = new dns.Resolver();
  if (servers) resolver.setServers(servers);
  const started = performance.now();
  const answers: Record<string, string[]> = {};
  try {
    for (const target of targets) answers[target] = await resolver.resolve4(target);
    return { resolver: name, answers, latencyMs: Math.round(performance.now() - started) };
  } catch (error) {
    return { resolver: name, answers, latencyMs: Math.round(performance.now() - started), error: error instanceof Error ? error.message : "DNS sorgusu başarısız." };
  }
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(`dns:${clientIp}`, 10, 60_000)) return rateLimitResponse();
  const system = await testResolver("Sunucunun varsayılan resolver’ı");
  const cloudflare = await testResolver("Cloudflare 1.1.1.1", ["1.1.1.1"]);
  const google = await testResolver("Google 8.8.8.8", ["8.8.8.8"]);
  return Response.json(
    {
      scope: "server",
      testedAt: new Date().toISOString(),
      system,
      publicResolvers: [cloudflare, google],
      limitation: "Bu sonuç, uygulama sunucusunun DNS çözümlemesini test eder. Tarayıcının veya VPN’in yerel DNS trafiği bu HTTP isteğinden doğrudan görülemez; bu nedenle tek başına kesin DNS sızıntısı kanıtı değildir."
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
