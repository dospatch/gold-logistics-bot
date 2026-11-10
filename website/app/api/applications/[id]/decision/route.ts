import { NextRequest,NextResponse } from "next/server";
import { discordApi,requireManager } from "@/lib/management";
export const runtime="nodejs";
export async function POST(request:NextRequest,context:{params:Promise<{id:string}>}){
 const {session,response}=await requireManager(request);if(!session)return response!;
 try{
  const {id}=await context.params;if(!/^\d{17,20}$/.test(id))return NextResponse.json({error:"Invalid application ticket."},{status:400});
  const body=await request.json();const decisions=["approve","deny","request-info","hold"];
  if(!decisions.includes(body.decision))return NextResponse.json({error:"Choose a valid staff decision."},{status:400});
  const guildId=process.env.GUILD_ID;
  const channelsResponse=await discordApi("/guilds/"+guildId+"/channels");if(!channelsResponse.ok)throw new Error("Could not load Discord channels.");
  const channels=await channelsResponse.json();const channel=channels.find((c:any)=>c.id===id&&String(c.topic||"").startsWith("BCGL_APP|"));
  if(!channel)return NextResponse.json({error:"Application ticket was not found."},{status:404});
  const messagesResponse=await discordApi("/channels/"+id+"/messages?limit=50");if(!messagesResponse.ok)return NextResponse.json({error:"Application record was not found."},{status:404});
  const messages=await messagesResponse.json();const message=messages.find((m:any)=>["🚛 BC Gold Logistics — Driver Application","🏢 BC Gold Logistics — VTC Employment Application"].includes(m.embeds?.[0]?.title));if(!message?.embeds?.[0])return NextResponse.json({error:"Application details are missing."},{status:422});
  const isDriver=String(message.embeds[0].title).includes("Driver Application");
  const fields=message.embeds[0].fields||[];const applicantId=String(channel.topic).split("|")[1];
  const get=(name:string)=>fields.find((f:any)=>f.name===name)?.value||"";
  const oldStatus=get("Status")||"Pending";
  if(!["Pending","On Hold","More Information Requested"].includes(oldStatus))return NextResponse.json({error:"This application has already received a final decision."},{status:409});
  const approved=body.decision==="approve";let roleToAssign:any=null;
  if(approved){
   const roleResponse=await discordApi("/guilds/"+guildId+"/roles");if(!roleResponse.ok)return NextResponse.json({error:"Could not verify the company membership role. Try again."},{status:502});
   const roleList=await roleResponse.json();roleToAssign=roleList.find((r:any)=>r.name===(isDriver?"Company Driver":"Employee"));
   if(!roleToAssign)return NextResponse.json({error:isDriver?'The "Company Driver" Discord role is missing. Run /setup-company or create the role before approving ATS drivers.':'The "Employee" Discord role is missing. Create it before approving this application.'},{status:409});
  }
  const statusMap:any={approve:"Approved",deny:"Denied","request-info":"More Information Requested",hold:"On Hold"};
  const status=statusMap[body.decision];
  const staffNote=String(body.note||"").trim().slice(0,1000);
  const embed={...message.embeds[0],color:approved?0x2ecc71:body.decision==="deny"?0xe74c3c:0xd4af37,fields:[...fields.filter((f:any)=>!["Status","Decision","Staff note"].includes(f.name)),{name:"Status",value:status,inline:true},{name:"Decision",value:"Reviewed by "+session.username+" on the website",inline:true}]};
  const edit=await discordApi("/channels/"+id+"/messages/"+message.id,{method:"PATCH",body:JSON.stringify({embeds:[embed]})});
  if(!edit.ok)return NextResponse.json({error:"Could not update the application ticket."},{status:502});
  const topicParts=String(channel.topic).split("|");topicParts[3]=status;
  const topicUpdate=await discordApi("/channels/"+id,{method:"PATCH",body:JSON.stringify({topic:topicParts.join("|")})});
  const publicMessage=body.decision==="approve"?(isDriver?"Your ATS driver application has been approved. Welcome to the BC Gold Logistics fleet! Your Company Driver role is being activated.":"Your employment application has been approved. Welcome to BC Gold Logistics."):body.decision==="deny"?"Thank you for applying. Management has decided not to move forward at this time. We appreciate your interest.":body.decision==="request-info"?"Recruitment needs more information before completing your review. Please reply to your private application ticket or contact the recruitment team.":"Your application has been placed on hold. Management will contact you when the review resumes.";
  if(staffNote){const privateReview=channels.find((c:any)=>(c.name==="applications-review"||c.name==="hr-staff-chat")&&c.type===0);if(privateReview)await discordApi("/channels/"+privateReview.id+"/messages",{method:"POST",body:JSON.stringify({content:"**Private recruitment note — Application #"+(topicParts[2]||"")+"**\nApplicant ID: "+applicantId+"\nReviewer: "+session.username+"\n"+staffNote,allowed_mentions:{parse:[]}})});}
  const post=await discordApi("/channels/"+id+"/messages",{method:"POST",body:JSON.stringify({content:"<@"+applicantId+"> "+publicMessage,allowed_mentions:{users:[applicantId]}})});
  let membershipRoleAssigned=false,warning="";
  if(approved&&roleToAssign){
   const assigned=await discordApi("/guilds/"+guildId+"/members/"+applicantId+"/roles/"+roleToAssign.id,{method:"PUT"});
   membershipRoleAssigned=assigned.ok;
   if(!assigned.ok)warning="Application approved, but Discord did not assign the Company Driver role. Check bot Manage Roles permission and role hierarchy.";
  }
  let dmSent=false;
  try{
   const dmChannel=await discordApi("/users/@me/channels",{method:"POST",body:JSON.stringify({recipient_id:applicantId})});
   if(dmChannel.ok){
    const dm=await dmChannel.json();
    const title=approved?"🎉 BC Gold Logistics — You're approved!":body.decision==="deny"?"BC Gold Logistics — Application Update":body.decision==="request-info"?"BC Gold Logistics — More information needed":"BC Gold Logistics — Application on hold";
    const details=approved?"Welcome to the fleet! Your next step is to review the driver standards, connect to the company Discord, and watch for dispatch or onboarding instructions.":body.decision==="deny"?"Thank you for taking the time to apply. You may contact recruitment if you have questions about this decision.":body.decision==="request-info"?"Please reply in your private application ticket with the additional details requested by recruitment.": "No action is needed right now. We will send another DM when management resumes the review.";
    const dmEmbed={title,color:approved?0x2ecc71:body.decision==="deny"?0xe74c3c:0xd4af37,description:details,fields:[{name:"Application",value:"#"+(topicParts[2]||"") ,inline:true},{name:"Status",value:status,inline:true},{name:"Your private ticket",value:"https://discord.com/channels/"+guildId+"/"+id}],footer:{text:"BC Gold Logistics · Driven by Excellence. United by the Road."},timestamp:new Date().toISOString()};
    const sent=await discordApi("/channels/"+dm.id+"/messages",{method:"POST",body:JSON.stringify({embeds:[dmEmbed]})});dmSent=sent.ok;
   }
  }catch(e){console.error("Applicant status DM failed:",e);}
  if(!post.ok)warning=(warning?warning+" ":"")+"Ticket notification could not be posted.";
  if(!dmSent)warning=(warning?warning+" ":"")+"Status updated, but the applicant DM could not be delivered. They may have DMs disabled.";
  if(!topicUpdate.ok)warning=(warning?warning+" ":"")+"Ticket status metadata could not be synchronized.";
  return NextResponse.json({ok:true,status,notification:post.ok?"posted-in-ticket":"failed",dmSent,membershipRoleAssigned,warning:warning||undefined});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Decision failed."},{status:500});}
}
