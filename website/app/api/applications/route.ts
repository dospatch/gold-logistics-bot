import { NextRequest,NextResponse } from "next/server";
import { discordApi,requireManager } from "@/lib/management";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const {session,response}=await requireManager(request);if(!session)return response!;
 try{
  const guildId=process.env.GUILD_ID;
  const list=await discordApi("/guilds/"+guildId+"/channels");
  if(!list.ok)return NextResponse.json({error:"Discord could not load recruitment tickets."},{status:502});
  const channels=await list.json();
  const category=channels.find((c:any)=>c.type===4&&c.name==="📝 RECRUITMENT");
  if(!category)return NextResponse.json({applications:[]});
  const tickets=channels.filter((c:any)=>c.parent_id===category.id&&String(c.topic||"").startsWith("BCGL_APP|"));
  const applications=[];
  for(const channel of tickets){
   const parts=channel.topic.split("|");
   const messagesResponse=await discordApi("/channels/"+channel.id+"/messages?limit=1");
   if(!messagesResponse.ok)continue;
   const messages=await messagesResponse.json();const message=messages[0];const embed=message?.embeds?.[0];if(!embed)continue;
   const fields=embed.fields||[];const get=(name:string)=>fields.find((f:any)=>f.name===name)?.value||"";
   applications.push({id:channel.id,channelName:channel.name,number:parts[2]||"",applicantId:parts[1]||"",applicant:get("Applicant").split("\\n")[0].replace(/\\s*\\(@.*$/,""),discordUsername:get("Applicant").match(/@([^ )]+)/)?.[1]||"",games:get("Game"),truck:get("Preferred truck"),experience:get("Experience"),availability:get("Availability"),about:get("Why they want to join"),status:get("Status")||parts[3]||"Pending",createdAt:message.timestamp});
  }
  applications.sort((a:any,b:any)=>b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({applications},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not load applications."},{status:500});}
}
