import {NextRequest,NextResponse} from "next/server";
import {getApplicant} from "@/lib/applicant";
export const runtime="nodejs";
const guildId=()=>process.env.DISCORD_GUILD_ID||process.env.GUILD_ID||"";
const botToken=()=>process.env.DISCORD_BOT_TOKEN||process.env.DISCORD_TOKEN||"";
const headers=()=>({Authorization:"Bot "+botToken(),"Content-Type":"application/json"});
async function discord(path:string,init:RequestInit={}){return fetch("https://discord.com/api/v10"+path,{...init,headers:{...headers(),...(init.headers||{})},cache:"no-store"});}
const departments=["Executive & Company Administration","Transportation & Driver Operations","Dispatch & Freight Coordination","Fleet & Equipment Management","Safety & Training","Human Resources & Recruitment","Technology & Systems","Convoy & Community Operations"];
export async function POST(request:NextRequest){
 const applicant=getApplicant(request);if(!applicant)return NextResponse.json({error:"Connect your Discord account before submitting."},{status:401});
 const guild=guildId(),token=botToken();
 if(!token||!guild)return NextResponse.json({error:"Employment application service is not configured."},{status:503});
 try{
  const body=await request.json(),department=String(body.department||"").trim(),position=String(body.position||"").trim(),experience=String(body.experience||"").trim(),availability=String(body.availability||"").trim(),about=String(body.about||"").trim();
  if(!departments.includes(department)||!position||position.length>100||!experience||experience.length>1500||!availability||availability.length>500||!about||about.length>1200)return NextResponse.json({error:"Complete each field using the stated character limits."},{status:400});
  const [cr,rr]=await Promise.all([discord("/guilds/"+guild+"/channels"),discord("/guilds/"+guild+"/roles")]);
  if(!cr.ok||!rr.ok)throw new Error("The bot cannot read Discord channels or roles. Check the bot token and View Channels permission.");
  const channels=await cr.json(),roles=await rr.json(),category=channels.find((c:any)=>c.type===4&&c.name==="👥 HUMAN RESOURCES");
  if(!category)throw new Error("The Human Resources category was not found. Run /setup-company.");
  const staffNames=["Owner","President","Chief Executive Officer","Chief Operating Officer","HR Director","HR Manager","Recruiter"];
  const staffRoles=roles.filter((r:any)=>staffNames.includes(r.name));
  if(!staffRoles.length)throw new Error("No HR access roles were found. Create an HR Director, HR Manager, or Recruiter role before accepting applications.");
  const overwrites=[{id:guild,type:0,deny:"1024"},...staffRoles.map((r:any)=>({id:r.id,type:0,allow:"68608"})),{id:applicant.id,type:1,allow:"68608"}];
  if(process.env.CLIENT_ID)overwrites.push({id:process.env.CLIENT_ID,type:1,allow:"68608"} as any);
  const tickets=channels.filter((c:any)=>c.parent_id===category.id&&String(c.topic||"").startsWith("BCGL_APP|"));
  const existingNumbers=tickets.map((c:any)=>Number(String(c.topic).split("|")[2])||0);
  const number=String(Math.max(0,...existingNumbers)+1).padStart(4,"0"),safe=(applicant.username||"applicant").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,18)||"applicant";
  const created=await discord("/guilds/"+guild+"/channels",{method:"POST",body:JSON.stringify({name:"employment-"+number+"-"+safe,type:0,parent_id:category.id,topic:"BCGL_APP|"+applicant.id+"|"+number+"|Pending|Employment",permission_overwrites:overwrites})});
  if(!created.ok)throw new Error("Could not create a private HR application ticket ("+created.status+").");
  const channel=await created.json();
  const embed={title:"🏢 BC Gold Logistics — VTC Employment Application",color:0xD4AF37,description:"Private Human Resources application #"+number,fields:[
   {name:"Applicant",value:(applicant.globalName||applicant.username)+" (@"+applicant.username+")\nDiscord ID: "+applicant.id},
   {name:"Department",value:department},{name:"Position",value:position},{name:"Experience & qualifications",value:experience},
   {name:"Availability",value:availability},{name:"Why you want to join BC Gold Logistics",value:about},{name:"Status",value:"Pending",inline:true}
  ],footer:{text:"BC Gold Logistics | Human Resources"},timestamp:new Date().toISOString()};
  const posted=await discord("/channels/"+channel.id+"/messages",{method:"POST",body:JSON.stringify({embeds:[embed]})});
  if(!posted.ok){await discord("/channels/"+channel.id,{method:"DELETE"});throw new Error("The ticket was created but its application record could not be posted.");}
  let dmSent=false,warning="";
  try{
   const dmChannel=await discord("/users/@me/channels",{method:"POST",body:JSON.stringify({recipient_id:applicant.id})});
   if(dmChannel.ok){
    const dm=await dmChannel.json();
    const sent=await discord("/channels/"+dm.id+"/messages",{method:"POST",body:JSON.stringify({embeds:[{title:"📨 BC Gold Logistics — Application Received",color:0xD4AF37,description:"Your employment application has been received and saved in a private Human Resources ticket. Recruitment will review it and send updates here.",fields:[{name:"Application number",value:"#"+number,inline:true},{name:"Department",value:department,inline:true},{name:"Current status",value:"Pending review",inline:true},{name:"Private application ticket",value:"https://discord.com/channels/"+guild+"/"+channel.id}],footer:{text:"BC Gold Logistics · Driven by Excellence. United by the Road."},timestamp:new Date().toISOString()}]})});
    dmSent=sent.ok;
   }
   if(!dmSent)warning="Your application was saved, but Discord could not deliver the confirmation DM. Check your server direct-message settings.";
  }catch{warning="Your application was saved, but Discord could not deliver the confirmation DM. Check your server direct-message settings.";}
  return NextResponse.json({ok:true,number,channelId:channel.id,channelName:channel.name,dmSent,warning:warning||undefined});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Employment application could not be submitted."},{status:500});}
}
