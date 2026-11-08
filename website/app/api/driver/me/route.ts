import { NextRequest,NextResponse } from "next/server";
import { getApplicant } from "@/lib/applicant";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const user=getApplicant(request);
 if(!user)return NextResponse.json({authenticated:false},{status:401,headers:{"Cache-Control":"no-store"}});
 const guildId=process.env.GUILD_ID,token=process.env.DISCORD_TOKEN;
 if(!guildId||!token)return NextResponse.json({error:"Driver portal is not configured yet."},{status:503});
 const [guildResponse,memberResponse,rolesResponse]=await Promise.all([
  fetch("https://discord.com/api/v10/guilds/"+guildId,{headers:{Authorization:"Bot "+token},cache:"no-store"}),
  fetch("https://discord.com/api/v10/guilds/"+guildId+"/members/"+user.id,{headers:{Authorization:"Bot "+token},cache:"no-store"}),
  fetch("https://discord.com/api/v10/guilds/"+guildId+"/roles",{headers:{Authorization:"Bot "+token},cache:"no-store"})
 ]);
 if(!memberResponse.ok)return NextResponse.json({authenticated:false,notMember:true},{status:403,headers:{"Cache-Control":"no-store"}});
 if(!guildResponse.ok||!rolesResponse.ok)return NextResponse.json({error:"Could not verify your company membership. Please try again."},{status:502});
 const [guild,member,roles]=await Promise.all([guildResponse.json(),memberResponse.json(),rolesResponse.json()]);
 const roleNames=(member.roles||[]).map((id:string)=>roles.find((role:any)=>role.id===id)?.name).filter(Boolean);
 if(!roleNames.includes("Company Driver"))return NextResponse.json({authenticated:true,approved:false,error:"Your account does not have the approved Company Driver role yet. Management must approve your application first."},{status:403,headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({authenticated:true,driver:{name:user.globalName||user.username,username:user.username,discordId:user.id,server:guild.name,joinedAt:member.joined_at||null,roles:roleNames}}, {headers:{"Cache-Control":"no-store"}});
}
