import { NextRequest,NextResponse } from "next/server";
import { applicantCookie,APPLICANT_COOKIE } from "@/lib/applicant";
export const runtime="nodejs";
export async function GET(request:NextRequest) {
  const state=request.nextUrl.searchParams.get("state"), code=request.nextUrl.searchParams.get("code");
  const saved=request.cookies.get("bcgl_apply_state")?.value, origin=request.cookies.get("bcgl_apply_origin")?.value||request.nextUrl.origin, returnTo=["/careers/apply","/careers/track","/apply/driver"].includes(request.cookies.get("bcgl_apply_return")?.value||"")?(request.cookies.get("bcgl_apply_return")?.value as string):"/careers/apply";
  if(!state||state!==saved||!code) return NextResponse.redirect(new URL(returnTo+"?error=discord_auth",origin));
  const redirectUri=origin+"/api/apply/discord/callback";
  const tokenResponse=await fetch("https://discord.com/api/v10/oauth2/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:process.env.CLIENT_ID||"",client_secret:process.env.CLIENT_SECRET||"",grant_type:"authorization_code",code,redirect_uri:redirectUri})});
  const token=await tokenResponse.json();
  if(!tokenResponse.ok||!token.access_token) {
    console.error("[BCGL OAuth] Discord token exchange failed",{status:tokenResponse.status,error:token.error,description:token.error_description});
    return NextResponse.redirect(new URL(returnTo+"?error=discord_auth",origin));
  }
  const guildId=process.env.DISCORD_GUILD_ID||process.env.GUILD_ID||"";
  const botToken=process.env.DISCORD_BOT_TOKEN||process.env.DISCORD_TOKEN||"";
  const userResponse=await fetch("https://discord.com/api/v10/users/@me",{headers:{authorization:"Bearer "+token.access_token}});
  const user=await userResponse.json();
  if(!userResponse.ok||!user.id) {
    console.error("[BCGL OAuth] Discord user lookup failed",{status:userResponse.status});
    return NextResponse.redirect(new URL(returnTo+"?error=discord_auth",origin));
  }
  if(!guildId) {
    console.error("[BCGL OAuth] Discord membership verification is missing DISCORD_GUILD_ID");
    return NextResponse.redirect(new URL(returnTo+"?error=server_membership",origin));
  }

  // Prefer checking membership with the company bot. This avoids rejecting valid
  // applicants when Discord's user-scoped guild-members endpoint is unavailable.
  let memberResponse:Response|null=null;
  if(botToken) {
    memberResponse=await fetch("https://discord.com/api/v10/guilds/"+guildId+"/members/"+user.id,{headers:{authorization:"Bot "+botToken}});
  }
  if(!memberResponse?.ok) {
    const oauthMemberResponse=await fetch("https://discord.com/api/v10/users/@me/guilds/"+guildId+"/member",{headers:{authorization:"Bearer "+token.access_token}});
    if(oauthMemberResponse.ok) memberResponse=oauthMemberResponse;
    else {
      const memberError=await oauthMemberResponse.text();
      console.error("[BCGL OAuth] Discord membership verification failed",{userStatus:userResponse.status,botMemberStatus:memberResponse?.status??"not_configured",oauthMemberStatus:oauthMemberResponse.status,memberError,guildConfigured:true,botConfigured:Boolean(botToken)});
      return NextResponse.redirect(new URL(returnTo+"?error=server_membership",origin));
    }
  }

  const response=NextResponse.redirect(new URL(returnTo,origin));
  response.cookies.set(APPLICANT_COOKIE,applicantCookie({id:user.id,username:user.username,globalName:user.global_name||user.username}),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:7200});
  response.cookies.delete("bcgl_apply_state"); response.cookies.delete("bcgl_apply_origin"); response.cookies.delete("bcgl_apply_return");
  return response;
}
