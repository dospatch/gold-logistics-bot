import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const MANAGER_ROLES = ["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Executive Director","HR Director","HR Manager","Transportation Director","Transportation Manager","Fleet Director","Dispatch Director","Dispatch Supervisor","Warehouse Director","Warehouse Manager","Carrier Services Director","Safety & Compliance Director","Security Director","Security Supervisor","Finance Director","IT & Facilities Director","IT Manager","Facilities Manager","Department Manager","Shift Manager","Supervisor"];
export const COOKIE_NAME = "bcgl_session";
export type ManagerSession = { userId: string; username: string; roles: string[]; exp: number };

function secret() {
  const value = process.env.WEB_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("WEB_SESSION_SECRET must be configured with at least 32 characters.");
  return value;
}
function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function makeSession(session: ManagerSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return payload + "." + signature(payload);
}
export function verifySession(raw?: string | null): ManagerSession | null {
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = signature(payload);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as ManagerSession;
    if (!session.userId || !session.exp || session.exp < Date.now()) return null;
    if (!session.roles.some(role => MANAGER_ROLES.includes(role))) return null;
    return session;
  } catch { return null; }
}
export async function currentManager() {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE_NAME)?.value);
}
export async function requireManager(request: NextRequest) {
  const session = verifySession(request.cookies.get(COOKIE_NAME)?.value);
  if (!session) return { session: null, response: NextResponse.json({ error: "Please sign in with an authorized management Discord account." }, { status: 401 }) };
  return { session, response: null };
}
export function discordHeaders() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error("DISCORD_TOKEN is not configured in Vercel.");
  return { Authorization: "Bot " + token, "Content-Type": "application/json" };
}
export async function reviewChannelId() {
  const guildId = process.env.GUILD_ID;
  if (!guildId) throw new Error("GUILD_ID is not configured in Vercel.");
  const response = await fetch("https://discord.com/api/v10/guilds/" + guildId + "/channels", { headers: discordHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error("Unable to read Discord server channels (" + response.status + ").");
  const channels = await response.json();
  const channel = channels.find((item: { name: string; type: number; id: string }) => item.name === "applications-review" && item.type === 0);
  if (!channel) throw new Error("The applications-review channel was not found.");
  return channel.id as string;
}
export async function discordApi(path: string, init: RequestInit = {}) {
  return fetch("https://discord.com/api/v10" + path, { ...init, headers: { ...discordHeaders(), ...(init.headers || {}) }, cache: "no-store" });
}
