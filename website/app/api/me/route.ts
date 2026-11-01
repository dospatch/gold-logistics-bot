import { NextRequest, NextResponse } from "next/server";
import { requireManager } from "@/lib/management";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const { session, response } = await requireManager(request);
  if (!session) return response!;
  return NextResponse.json({ user: { username: session.username, roles: session.roles } }, { headers: { "Cache-Control": "no-store" } });
}
