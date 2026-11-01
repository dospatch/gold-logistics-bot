import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const clientId = process.env.CLIENT_ID;
  const base = process.env.WEB_BASE_URL || request.nextUrl.origin;
  if (!clientId || !process.env.DISCORD_CLIENT_SECRET || !process.env.WEB_SESSION_SECRET || !process.env.DISCORD_TOKEN || !process.env.GUILD_ID) {
    return NextResponse.json({ error: "Website sign-in is not configured. Add the required environment variables in Vercel." }, { status: 503 });
  }
  const state = randomBytes(24).toString("hex");
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", base.replace(/\/$/, "") + "/auth/discord/callback");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("bcgl_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
