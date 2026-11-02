import { NextRequest,NextResponse } from "next/server";
import { applicantCookie,APPLICANT_COOKIE } from "@/lib/applicant";
export const runtime="nodejs";
export async function GET(request:NextRequest) {
  const state=request.nextUrl.searchParams.get("state"), code=request.nextUrl.searchParams.get("code");
  const saved=request.cookies.get("bcgl_apply_state")?.value, origin=request.cookies.get("bcgl_apply_origin")?.value||request.nextUrl.origin;
  if(!state||state!==saved||!code) return NextResponse.redirect(new URL("/apply?error=discord_auth",origin));
  const redirectUri=origin+"/api/apply/discord/callback";
  const tokenResponse=await fetch("https://discord.com/api/v10/oauth2/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:process.env.CLIENT_ID||"",client_secret:process.env.DISCORD_CLIENT_SECRET||"",grant_type:"authorization_code",code,redirect_uri:redirectUri})});
  const token=await tokenResponse.json();
  if(!tokenResponse.ok||!token.access_token) return NextResponse.redirect(new URL("/apply?error=discord_auth",origin));
  const userResponse=await fetch("https://discord.com/api/v10/users/@me",{headers:{authorization:"Bearer "+token.access_token}});
  const user=await userResponse.json();
  if(!userResponse.ok||!user.id) return NextResponse.redirect(new URL("/apply?error=discord_auth",origin));
  const response=NextResponse.redirect(new URL("/apply",origin));
  response.cookies.set(APPLICANT_COOKIE,applicantCookie({id:user.id,username:user.username,globalName:user.global_name||user.username}),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:7200});
  response.cookies.delete("bcgl_apply_state"); response.cookies.delete("bcgl_apply_origin");
  return response;
}
