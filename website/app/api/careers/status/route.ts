import {NextRequest,NextResponse} from "next/server";
import {getApplicant} from "@/lib/applicant";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const applicant=getApplicant(request);
 if(!applicant)return NextResponse.json({authenticated:false,applications:[]},{headers:{"Cache-Control":"no-store"}});
 if(!process.env.DISCORD_TOKEN||!process.env.GUILD_ID)return NextResponse.json({error:"Application tracking is not configured."},{status:503});
 const headers={Authorization:"Bot "+process.env.DISCORD_TOKEN};
 try{
  const channelsResponse=await fetch("https://discord.com/api/v10/guilds/"+process.env.GUILD_ID+"/channels",{headers,cache:"no-store"});
  if(!channelsResponse.ok)return NextResponse.json({error:"Could not load your application records."},{status:502});
  const channels=await channelsResponse.json();
  const category=channels.find((c:any)=>c.type===4&&c.name==="👥 HUMAN RESOURCES");
  if(!category)return NextResponse.json({authenticated:true,applications:[]},{headers:{"Cache-Control":"no-store"}});
  const own=channels.filter((c:any)=>c.parent_id===category.id&&String(c.topic||"").startsWith("BCGL_APP|"+applicant.id+"|"));
  const applications=[];
  for(const channel of own){
   const parts=String(channel.topic).split("|");
   const messagesResponse=await fetch("https://discord.com/api/v10/channels/"+channel.id+"/messages?limit=50",{headers,cache:"no-store"});
   if(!messagesResponse.ok)continue;
   const messages=await messagesResponse.json();
   const message=messages.find((m:any)=>["🚛 BC Gold Logistics — Driver Application","🏢 BC Logistics LLC — Employment Application"].includes(m.embeds?.[0]?.title));
   const embed=message?.embeds?.[0];if(!embed)continue;
   const fields=embed.fields||[];
   const get=(name:string)=>fields.find((f:any)=>f.name===name)?.value||"";
   const isEmployment=String(embed.title).includes("Employment");
   applications.push({number:parts[2]||"",status:get("Status")||parts[3]||"Pending",type:isEmployment?"Employment":"ATS Driver",department:get("Department")||"Transportation & Company Fleet",position:get("Position")||"Company Driver",submittedAt:message.timestamp||null});
  }
  applications.sort((a:any,b:any)=>String(b.submittedAt||"").localeCompare(String(a.submittedAt||"")));
  return NextResponse.json({authenticated:true,applications},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Could not load your application records right now."},{status:500});}
}
