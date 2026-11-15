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
 const guild=guildId(),token=botToken();if(!token||!guild)return NextResponse.json({error:"Employment application service is not configured."},{status:503});
 try{
  const body=await request.json(),type=String(body.applicationType||"staff"),department=String(body.department||"").trim(),position=String(body.position||"").trim(),answers=body.answers&&typeof body.answers==="object"&&!Array.isArray(body.answers)?body.answers:{};
  if(!["driver","staff","leadership"].includes(type)||!departments.includes(department)||!position||position.length>100)return NextResponse.json({error:"Choose a valid application type, department, and position."},{status:400});
  const entries=Object.entries(answers).map(([q,a])=>[String(q).trim(),String(a||"").trim()] as [string,string]);
  if(entries.length<5||entries.length>60||entries.some(([q,a])=>!q||q.length>250||!a||a.length>1500)||entries.reduce((n,[q,a])=>n+q.length+a.length,0)>30000)return NextResponse.json({error:"Complete all application questions. Each answer must be 1–1,500 characters."},{status:400});
  const [cr,rr]=await Promise.all([discord("/guilds/"+guild+"/channels"),discord("/guilds/"+guild+"/roles")]);
  if(!cr.ok||!rr.ok)throw new Error("The bot cannot read Discord channels or roles. Check the bot token and View Channels permission.");
  const channels=await cr.json(),roles=await rr.json(),category=channels.find((c:any)=>c.type===4&&c.name==="🔒 HR PRIVATE");
  if(!category)throw new Error("The Human Resources category was not found. Run /setup-company.");
  const staffNames=["Owner","President","Chief Executive Officer","Chief Operating Officer","Executive Director","HR Director","HR Manager","Recruiter"];
  const staffRoles=roles.filter((r:any)=>staffNames.includes(r.name));if(!staffRoles.length)throw new Error("No HR access roles were found. Create an HR Director, HR Manager, or Recruiter role before accepting applications.");
  const overwrites=[{id:guild,type:0,deny:"1024"},...staffRoles.map((r:any)=>({id:r.id,type:0,allow:"68608"})),{id:applicant.id,type:1,allow:"68608"}];
  if(process.env.CLIENT_ID)overwrites.push({id:process.env.CLIENT_ID,type:1,allow:"68608"} as any);
  const tickets=channels.filter((c:any)=>c.parent_id===category.id&&String(c.topic||"").startsWith("BCGL_APP|"));
  const existingNumbers=tickets.map((c:any)=>Number(String(c.topic).split("|")[2])||0),number=String(Math.max(0,...existingNumbers)+1).padStart(4,"0");
  const safe=(applicant.username||"applicant").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,18)||"applicant";
  const kind=type==="driver"?"Driver":type==="staff"?"Department Staff":"Department Leadership";
  const created=await discord("/guilds/"+guild+"/channels",{method:"POST",body:JSON.stringify({name:"application-"+number+"-"+safe,type:0,parent_id:category.id,topic:"BCGL_APP|"+applicant.id+"|"+number+"|Pending|"+kind.replace(/ /g,"_"),permission_overwrites:overwrites})});
  if(!created.ok)throw new Error("Could not create a private HR application ticket ("+created.status+").");
  const channel=await created.json(),title="BC Gold Logistics — "+kind+" Application";
  const embed={title:"📋 "+title,color:0xD4AF37,description:"Private "+kind.toLowerCase()+" #"+number+". All detailed answers are recorded in the messages below.",fields:[{name:"Applicant",value:(applicant.globalName||applicant.username)+" (@"+applicant.username+")\nDiscord ID: "+applicant.id},{name:"Application type",value:kind,inline:true},{name:"Department",value:department,inline:true},{name:"Position",value:position,inline:true},{name:"Status",value:"Pending",inline:true}],footer:{text:"BC Gold Logistics | Human Resources"},timestamp:new Date().toISOString()};
  const posted=await discord("/channels/"+channel.id+"/messages",{method:"POST",body:JSON.stringify({embeds:[embed]})});
  if(!posted.ok){await discord("/channels/"+channel.id,{method:"DELETE"});throw new Error("The ticket was created but its application record could not be posted.");}
  const lines=entries.map(([q,a],i)=>"**"+(i+1)+". "+q+"**\n"+a),chunks:string[]=[];let current="";
  for(const line of lines){const next=current?current+"\n\n"+line:line;if(next.length>1750){if(current)chunks.push(current);current=line;}else current=next;}
  if(current)chunks.push(current);
  for(let i=0;i<chunks.length;i++){const sent=await discord("/channels/"+channel.id+"/messages",{method:"POST",body:JSON.stringify({content:"**APPLICATION ANSWERS · "+kind.toUpperCase()+" · PART "+(i+1)+"/"+chunks.length+"**\n"+chunks[i]})});if(!sent.ok)throw new Error("The application ticket was created, but one of the answer sections could not be saved. Contact recruitment and provide application #"+number+".");}
  let dmSent=false,warning="";
  try{const dmChannel=await discord("/users/@me/channels",{method:"POST",body:JSON.stringify({recipient_id:applicant.id})});if(dmChannel.ok){const dm=await dmChannel.json();const sent=await discord("/channels/"+dm.id+"/messages",{method:"POST",body:JSON.stringify({embeds:[{title:"📨 BC Gold Logistics — Application Received",color:0xD4AF37,description:"Your "+kind.toLowerCase()+" application has been received and saved in a private Human Resources ticket. Recruitment will review it and send updates here.",fields:[{name:"Application number",value:"#"+number,inline:true},{name:"Department",value:department,inline:true},{name:"Current status",value:"Pending review",inline:true},{name:"Private application ticket",value:"https://discord.com/channels/"+guild+"/"+channel.id}],footer:{text:"BC Gold Logistics · Driven by Excellence. United by the Road."},timestamp:new Date().toISOString()}]})});dmSent=sent.ok;}}
  catch{warning="Your application was saved, but Discord could not deliver the confirmation DM.";}
  if(!dmSent)warning=warning||"Your application was saved, but Discord could not deliver the confirmation DM. Check your server direct-message settings.";
  return NextResponse.json({ok:true,number,channelId:channel.id,channelName:channel.name,dmSent,warning:warning||undefined});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Employment application could not be submitted."},{status:500});}
}