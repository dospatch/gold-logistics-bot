import { NextRequest,NextResponse } from "next/server";
import { getApplicant } from "@/lib/applicant";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const user=getApplicant(request);
 if(!user)return NextResponse.json({authenticated:false},{status:401,headers:{"Cache-Control":"no-store"}});
 const guildId=process.env.GUILD_ID,token=process.env.DISCORD_TOKEN;
 if(!guildId||!token)return NextResponse.json({error:"Driver portal is not configured yet."},{status:503});
 const [guildResponse,memberResponse]=await Promise.all([
  fetch("https://discord.com/api/v10/guilds/"+guildId,{headers:{Authorization:"Bot "+token},cache:"no-store"}),
  fetch("https://discord.com/api/v10/guilds/"+guildId+"/members/"+user.id,{headers:{Authorization:"Bot "+token},cache:"no-store"})
 ]);
 if(!memberResponse.ok)return NextResponse.json({authenticated:false,notMember:true},{status:403});
 const [guild,member]=await Promise.all([guildResponse.json(),memberResponse.json()]);
 const rolesResponse=await fetch("https://discord.com/api/v10/guilds/"+guildId+"/roles",{headers:{Authorization:"Bot "+token},cache:"no-store"});
 const roles=rolesResponse.ok?await rolesResponse.json():[];
 const roleNames=(member.roles||[]).map((id:string)=>roles.find((role:any)=>role.id===id)?.name).filter(Boolean);
 return NextResponse.json({authenticated:true,driver:{name:user.globalName||user.username,username:user.username,discordId:user.id,server:guild.name,joinedAt:member.joined_at||null,roles:roleNames}}, {headers:{"Cache-Control":"no-store"}});
}