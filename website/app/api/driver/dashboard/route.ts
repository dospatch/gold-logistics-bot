import { NextRequest,NextResponse } from "next/server";
import { getApplicant } from "@/lib/applicant";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const user=getApplicant(request);
 if(!user)return NextResponse.json({error:"Sign in with Discord first."},{status:401});
 const guildId=process.env.GUILD_ID,token=process.env.DISCORD_TOKEN;
 if(!guildId||!token)return NextResponse.json({error:"Driver dashboard is not configured."},{status:503});
 const auth={Authorization:"Bot "+token};
 const [memberRes,rolesRes,channelsRes]=await Promise.all([
  fetch("https://discord.com/api/v10/guilds/"+guildId+"/members/"+user.id,{headers:auth,cache:"no-store"}),
  fetch("https://discord.com/api/v10/guilds/"+guildId+"/roles",{headers:auth,cache:"no-store"}),
  fetch("https://discord.com/api/v10/guilds/"+guildId+"/channels",{headers:auth,cache:"no-store"})
 ]);
 if(!memberRes.ok)return NextResponse.json({error:"Join the BC Gold Logistics Discord server to access your driver dashboard."},{status:403});
 if(!rolesRes.ok||!channelsRes.ok)return NextResponse.json({error:"Could not load company records."},{status:502});
 const [member,roles,channels]=await Promise.all([memberRes.json(),rolesRes.json(),channelsRes.json()]);
 const roleById=new Map(roles.map((r:any)=>[r.id,r.name]));
 const roleNames=(member.roles||[]).map((id:string)=>roleById.get(id)).filter(Boolean) as string[];
 const driverRoles=["Company Driver","Senior Driver","Probationary Driver","Driver Trainer"];
 if(!roleNames.some(r=>driverRoles.includes(r)))return NextResponse.json({error:"Your application must be approved and a driver role assigned before accessing this dashboard."},{status:403});
 const logChannel=channels.find((c:any)=>c.name==="delivery-logs"&&c.type===0);
 let messages:any[]=[];
 if(logChannel){
  const logs=await fetch("https://discord.com/api/v10/channels/"+logChannel.id+"/messages?limit=100",{headers:auth,cache:"no-store"});
  if(logs.ok)messages=await logs.json();
 }
 const completed=messages.map((m:any)=>{
  const embed=m.embeds?.[0];if(!embed)return null;
  const title=String(embed.title||"");
  if(!/Delivery Report|Delivery Completed Automatically/i.test(title))return null;
  const fields=embed.fields||[];
  const field=(name:string)=>fields.find((f:any)=>f.name.toLowerCase()===name.toLowerCase())?.value||"";
  const driver=field("Driver").match(/\d{17,20}/)?.[0];if(!driver)return null;
  const distance=field("Distance");
  const numeric=Number((distance.match(/[\d,.]+/)||[])[0]?.replace(/,/g,"")||0);
  return {driverId:driver,game:field("Game")||"ATS",cargo:field("Cargo")||"Freight",route:field("Route")||"Route not recorded",distance,distanceValue:numeric,recordedAt:m.timestamp,title};
 }).filter(Boolean);
 const own=completed.filter((x:any)=>x.driverId===user.id);
 const leaderboard=completed.reduce((acc:any,x:any)=>{acc[x.driverId]=(acc[x.driverId]||0)+1;return acc;},{});
 const roster=await fetch("https://discord.com/api/v10/guilds/"+guildId+"/members?limit=1000",{headers:auth,cache:"no-store"});
 const memberList=roster.ok?await roster.json():[];
 const drivers=memberList.filter((m:any)=>(m.roles||[]).some((id:string)=>driverRoles.includes(String(roleById.get(id)||"")))).map((m:any)=>{
  const id=m.user.id;return {id,name:m.nick||m.user.global_name||m.user.username,username:m.user.username,roles:(m.roles||[]).map((r:string)=>roleById.get(r)).filter((r:string)=>driverRoles.includes(r)),deliveries:leaderboard[id]||0};
 }).sort((a:any,b:any)=>b.deliveries-a.deliveries||a.name.localeCompare(b.name));
 return NextResponse.json({driver:{id:user.id,name:member.nick||user.globalName||user.username,username:user.username,roles:roleNames,joinedAt:member.joined_at||null},stats:{completedDeliveries:own.length,recordedMiles:own.filter((x:any)=>x.unit==="mi").reduce((sum:number,x:any)=>sum+x.distanceValue,0),recordedKilometers:own.filter((x:any)=>x.unit==="km").reduce((sum:number,x:any)=>sum+x.distanceValue,0),unlabeledDistance:own.filter((x:any)=>x.unit==="unknown").reduce((sum:number,x:any)=>sum+x.distanceValue,0),recentDeliveries:own.slice(0,10)},roster:drivers,leaderboard:drivers.slice(0,10),recordsAvailable:!!logChannel},{headers:{"Cache-Control":"no-store"}});
}
