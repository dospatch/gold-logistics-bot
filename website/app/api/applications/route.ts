import { NextRequest,NextResponse } from "next/server";
import { discordApi,discordGuildId,requireManager } from "@/lib/management";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const {session,response}=await requireManager(request);if(!session)return response!;
 try{
  const guildId=discordGuildId(),list=await discordApi("/guilds/"+guildId+"/channels");
  if(!list.ok)return NextResponse.json({error:"Discord could not load recruitment tickets."},{status:502});
  const channels=await list.json(),category=channels.find((c:any)=>c.type===4&&c.name==="🔒 HR PRIVATE");
  if(!category)return NextResponse.json({applications:[]});
  const tickets=channels.filter((c:any)=>c.parent_id===category.id&&String(c.topic||"").startsWith("BCGL_APP|")),applications=[];
  for(const channel of tickets){
   const parts=String(channel.topic).split("|"),mr=await discordApi("/channels/"+channel.id+"/messages?limit=100");if(!mr.ok)continue;
   const messages=await mr.json(),message=messages.find((m:any)=>String(m.embeds?.[0]?.title||"").includes("BC Gold Logistics —")&&String(m.embeds?.[0]?.title||"").includes("Application"));
   const embed=message?.embeds?.[0];if(!embed)continue;
   const fields=embed.fields||[],get=(name:string)=>fields.find((f:any)=>f.name===name)?.value||"",answerMessages=messages.filter((m:any)=>String(m.content||"").startsWith("**APPLICATION ANSWERS"));
   const applicantField=get("Applicant"),kind=String(parts[4]||"");
   applications.push({id:channel.id,channelName:channel.name,number:parts[2]||"",applicantId:parts[1]||"",applicant:applicantField.split("\n")[0].replace(/\s*\(\s*@.*$/,""),discordUsername:applicantField.match(/@([^ )]+)/)?.[1]||"",applicationType:kind.replace(/_/g," ")||"Employment",department:get("Department"),position:get("Position"),status:get("Status")||parts[3]||"Pending",createdAt:message.timestamp,answers:answerMessages.map((m:any)=>m.content).join("\n\n"),ticketUrl:"https://discord.com/channels/"+guildId+"/"+channel.id});
  }
  applications.sort((a:any,b:any)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  return NextResponse.json({applications},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not load applications."},{status:500});}
}