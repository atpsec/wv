import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createPkcePair, googleConfigured, googleRedirectUri, setGoogleFlowCookies, siteOrigin } from "@/lib/google-auth";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`google-start:${ip}`, 10, 60_000)) {
    return Response.redirect(new URL("/?google_error=rate_limited", siteOrigin(request)), 302);
  }
  if (!googleConfigured()) {
    return Response.redirect(new URL("/?google_error=not_configured", siteOrigin(request)), 302);
  }

  const state = randomBytes(32).toString("base64url");
  const { verifier, challenge } = createPkcePair();
  await setGoogleFlowCookies(state, verifier);

  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account"
  }).toString();
  return Response.redirect(authorizationUrl, 302);
}
