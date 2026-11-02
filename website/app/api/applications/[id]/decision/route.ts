import { NextRequest,NextResponse } from "next/server";
import { discordApi,requireManager } from "@/lib/management";
export const runtime="nodejs";
export async function POST(request:NextRequest,context:{params:Promise<{id:string}>}){
 const {session,response}=await requireManager(request);if(!session)return response!;
 try{
  const {id}=await context.params;if(!/^\\d{17,20}$/.test(id))return NextResponse.json({error:"Invalid application ticket."},{status:400});
  const body=await request.json();const decisions=["approve","deny","request-info","hold"];
  if(!decisions.includes(body.decision))return NextResponse.json({error:"Choose a valid staff decision."},{status:400});
  const guildId=process.env.GUILD_ID;
  const channelsResponse=await discordApi("/guilds/"+guildId+"/channels");if(!channelsResponse.ok)throw new Error("Could not load Discord channels.");
  const channels=await channelsResponse.json();const channel=channels.find((c:any)=>c.id===id&&String(c.topic||"").startsWith("BCGL_APP|"));
  if(!channel)return NextResponse.json({error:"Application ticket was not found."},{status:404});
  const messagesResponse=await discordApi("/channels/"+id+"/messages?limit=50");if(!messagesResponse.ok)return NextResponse.json({error:"Application record was not found."},{status:404});
  const messages=await messagesResponse.json();const message=messages.find((m:any)=>m.embeds?.[0]?.title==="🚛 BC Gold Logistics — Driver Application");if(!message?.embeds?.[0])return NextResponse.json({error:"Application details are missing."},{status:422});
  const fields=message.embeds[0].fields||[];const get=(name:string)=>fields.find((f:any)=>f.name===name)?.value||"";
  const applicantId=channel.topic.split("|")[1];const oldStatus=get("Status")||"Pending";
  if(oldStatus!=="Pending"&&body.decision!=="request-info"&&body.decision!=="hold")return NextResponse.json({error:"This application has already received a final decision."},{status:409});
  const statusMap:any={approve:"Approved",deny:"Denied","request-info":"More Information Requested",hold:"On Hold"};
  const status=statusMap[body.decision];const approved=body.decision==="approve";
  const staffNote=String(body.note||"").trim().slice(0,1000);
  const embed={...message.embeds[0],color:approved?0x2ecc71:body.decision==="deny"?0xe74c3c:0xd4af37,fields:[...fields.filter((f:any)=>!["Status","Decision","Staff note"].includes(f.name)),{name:"Status",value:status,inline:true},{name:"Decision",value:"Reviewed by "+session.username+" on the website",inline:true},]};
  const edit=await discordApi("/channels/"+id+"/messages/"+message.id,{method:"PATCH",body:JSON.stringify({embeds:[embed]})});
  if(!edit.ok)return NextResponse.json({error:"Could not update the application ticket."},{status:502});
  const topicParts=String(channel.topic).split("|");topicParts[3]=status;
  await discordApi("/channels/"+id,{method:"PATCH",body:JSON.stringify({topic:topicParts.join("|")})});
  if(staffNote){const management=channels.find((c:any)=>c.name==="management-chat"&&c.type===0);if(management)await discordApi("/channels/"+management.id+"/messages",{method:"POST",body:JSON.stringify({content:"**Private staff note — Application #"+(topicParts[2]||"") +"**\nApplicant: <@"+applicantId+">\nReviewer: "+session.username+"\n"+staffNote,allowed_mentions:{parse:[]}})});}
  const publicMessage=body.decision==="approve"?"🎉 Your BC Gold Logistics application has been approved. Welcome to the fleet!":body.decision==="deny"?"Thank you for applying. Management has decided not to move forward with your application at this time.":body.decision==="request-info"?"Management needs a little more information. Please reply in this ticket so we can continue reviewing your application.":"Your application has been placed on hold. Management will update this ticket when review resumes.";
  const post=await discordApi("/channels/"+id+"/messages",{method:"POST",body:JSON.stringify({content:"<@"+applicantId+"> "+publicMessage,allowed_mentions:{users:[applicantId]}})});
  if(!post.ok)return NextResponse.json({ok:true,status,warning:"Decision saved, but ticket notification could not be posted."});
  return NextResponse.json({ok:true,status,notification:"posted-in-ticket"});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Decision failed."},{status:500});}
}
