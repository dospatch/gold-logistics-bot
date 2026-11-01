import { NextRequest, NextResponse } from "next/server";
import { makeSession, MANAGER_ROLES } from "@/lib/management";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const base = (process.env.WEB_BASE_URL || request.nextUrl.origin).replace(/\/$/, "");
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  if (!state || state !== request.cookies.get("bcgl_oauth_state")?.value || !code) return NextResponse.redirect(new URL("/management?error=signin", base));
  const clientId = process.env.CLIENT_ID, clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret || !process.env.GUILD_ID || !process.env.DISCORD_TOKEN) return NextResponse.redirect(new URL("/management?error=config", base));
  const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: base + "/auth/discord/callback" }), cache: "no-store"
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) return NextResponse.redirect(new URL("/management?error=oauth", base));
  const userResponse = await fetch("https://discord.com/api/v10/users/@me", { headers: { Authorization: "Bearer " + token.access_token }, cache: "no-store" });
  const user = await userResponse.json();
  if (!userResponse.ok || !user.id) return NextResponse.redirect(new URL("/management?error=user", base));
  const botHeaders = { Authorization: "Bot " + process.env.DISCORD_TOKEN };
  const [memberResponse, rolesResponse] = await Promise.all([
    fetch("https://discord.com/api/v10/guilds/" + process.env.GUILD_ID + "/members/" + user.id, { headers: botHeaders, cache: "no-store" }),
    fetch("https://discord.com/api/v10/guilds/" + process.env.GUILD_ID + "/roles", { headers: botHeaders, cache: "no-store" })
  ]);
  if (!memberResponse.ok || !rolesResponse.ok) return NextResponse.redirect(new URL("/management?error=membership", base));
  const [member, roles] = await Promise.all([memberResponse.json(), rolesResponse.json()]);
  const roleNames = (member.roles || []).map((id: string) => roles.find((role: { id: string; name: string }) => role.id === id)?.name).filter(Boolean) as string[];
  if (!roleNames.some((role: string) => MANAGER_ROLES.includes(role))) return NextResponse.redirect(new URL("/management?error=denied", base));
  const session = makeSession({ userId: user.id, username: user.global_name || user.username, roles: roleNames, exp: Date.now() + 8 * 60 * 60 * 1000 });
  const response = NextResponse.redirect(new URL("/management", base));
  response.cookies.set("bcgl_session", session, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
  response.cookies.set("bcgl_oauth_state", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
