import { cookies } from "next/headers";
import { upsertGoogleUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { clearGoogleFlowCookies, googleConfigured, googleErrorRedirect, googleRedirectUri, GOOGLE_STATE_COOKIE, GOOGLE_VERIFIER_COOKIE, siteOrigin, stateMatches } from "@/lib/google-auth";

export const runtime = "nodejs";

type GoogleTokenResponse = { access_token?: string };
type GoogleUserInfo = { sub?: string; email?: string; email_verified?: boolean; name?: string };

export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`google-callback:${ip}`, 20, 60_000)) return googleErrorRedirect(request, "rate_limited");

  const url = new URL(request.url);
  const providerError = url.searchParams.get("error");
  if (providerError) {
    await clearGoogleFlowCookies();
    return googleErrorRedirect(request, providerError === "access_denied" ? "cancelled" : "provider_error");
  }
  if (!googleConfigured()) {
    await clearGoogleFlowCookies();
    return googleErrorRedirect(request, "not_configured");
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
  const verifier = cookieStore.get(GOOGLE_VERIFIER_COOKIE)?.value;
  await clearGoogleFlowCookies();
  if (!code || !returnedState || !expectedState || !verifier || !stateMatches(expectedState, returnedState)) return googleErrorRedirect(request, "invalid_state");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: googleRedirectUri(request),
        grant_type: "authorization_code",
        code_verifier: verifier
      }),
      cache: "no-store"
    });
    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokenData.access_token) return googleErrorRedirect(request, "provider_error");

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: "no-store"
    });
    const googleUser = (await userResponse.json()) as GoogleUserInfo;
    if (!userResponse.ok) return googleErrorRedirect(request, "provider_error");
    if (!googleUser.sub || !googleUser.email || googleUser.email_verified !== true) return googleErrorRedirect(request, "invalid_account");

    await upsertGoogleUser({ sub: googleUser.sub, email: googleUser.email, displayName: googleUser.name || "" });
    return Response.redirect(new URL("/?auth=google", siteOrigin(request)), 302);
  } catch {
    return googleErrorRedirect(request, "provider_error");
  }
}
