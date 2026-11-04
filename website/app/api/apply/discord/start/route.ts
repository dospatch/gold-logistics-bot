import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
export const runtime="nodejs";
export async function GET(request:NextRequest) {
  const origin=request.nextUrl.origin;
  const state=randomBytes(24).toString("hex");
  const redirectUri=origin+"/api/apply/discord/callback";
  const returnTo=request.nextUrl.searchParams.get("returnTo")==="/careers/apply"?"/careers/apply":"/apply";
  const params=new URLSearchParams({client_id:process.env.CLIENT_ID||"",redirect_uri:redirectUri,response_type:"code",scope:"identify guilds.members.read",state});
  const response=NextResponse.redirect("https://discord.com/oauth2/authorize?"+params.toString());
  response.cookies.set("bcgl_apply_state",state,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:600});
  response.cookies.set("bcgl_apply_origin",origin,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:600});
  response.cookies.set("bcgl_apply_return",returnTo,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:600});
  return response;
}
