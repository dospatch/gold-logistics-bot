import {NextRequest,NextResponse} from "next/server";
import {getApplicant} from "@/lib/applicant";
export const runtime="nodejs";
const headers=()=>({Authorization:"Bot "+(process.env.DISCORD_TOKEN||""),"Content-Type":"application/json"});
async function discord(path:string,init:RequestInit={}){return fetch("https://discord.com/api/v10"+path,{...init,headers:{...headers(),...(init.headers||{})},cache:"no-store"});}
const departments=["Executive & Company Administration","Transportation & Driver Operations","Dispatch & Freight Coordination","Fleet & Equipment Management","Safety & Training","Human Resources & Recruitment","Technology & Systems","Convoy & Community Operations"];
export async function POST(request:NextRequest){
 const applicant=getApplicant(request);if(!applicant)return NextResponse.json({error:"Connect your Discord account before submitting."},{status:401});
 if(!process.env.DISCORD_TOKEN||!process.env.GUILD_ID)return NextResponse.json({error:"Employment application service is not configured."},{status:503});
 try{
  const body=await request.json(),department=String(body.department||"").trim(),position=String(body.position||"").trim(),experience=String(body.experience||"").trim(),availability=String(body.availability||"").trim(),about=String(body.about||"").trim();
  if(!departments.includes(department)||!position||position.length>100||!experience||experience.length>1500||!availability||availability.length>500||!about||about.length>1200)return NextResponse.json({error:"Complete each field using the stated character limits."},{status:400});
  const [cr,rr]=await Promise.all([discord("/guilds/"+process.env.GUILD_ID+"/channels"),discord("/guilds/"+process.env.GUILD_ID+"/roles")]);
  if(!cr.ok||!rr.ok)throw new Error("The bot cannot read Discord channels or roles.");
  const channels=await cr.json(),roles=await rr.json(),category=channels.find((c:any)=>c.type===4&&c.name==="👥 HUMAN RESOURCES");
  if(!category)throw new Error("The Human Resources category was not found. Run /setup-company.");
  const staffNames=["Owner","President","Chief Executive Officer","Chief Operating Officer","HR Director","HR Manager","Recruiter"];
  const staffRoles=roles.filter((r:any)=>staffNames.includes(r.name));
  const overwrites=[{id:process.env.GUILD_ID,type:0,deny:"1024"},...staffRoles.map((r:any)=>({id:r.id,type:0,allow:"68608"})),{id:applicant.id,type:1,allow:"68608"}];
  if(process.env.CLIENT_ID)overwrites.push({id:process.env.CLIENT_ID,type:1,allow:"68608"} as any);
  const tickets=channels.filter((c:any)=>c.parent_id===category.id&&String(c.topic||"").startsWith("BCGL_APP|"));
  const number=String(tickets.length+1).padStart(4,"0"),safe=(applicant.username||"applicant").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,18)||"applicant";
  const created=await discord("/guilds/"+process.env.GUILD_ID+"/channels",{method:"POST",body:JSON.stringify({name:"employment-"+number+"-"+safe,type:0,parent_id:category.id,topic:"BCGL_APP|"+applicant.id+"|"+number+"|Pending|Employment",permission_overwrites:overwrites})});
  if(!created.ok)throw new Error("Could not create a private HR application ticket ("+created.status+").");
  const channel=await created.json();
  const embed={title:"🏢 BC Gold Logistics — VTC Employment Application",color:0xD4AF37,description:"Private Human Resources application #"+number,fields:[
   {name:"Applicant",value:(applicant.globalName||applicant.username)+" (@"+applicant.username+")\nDiscord ID: "+applicant.id},
   {name:"Department",value:department},{name:"Position",value:position},{name:"Experience & qualifications",value:experience},
   {name:"Availability",value:availability},{name:"Why you want to join BC Gold Logistics",value:about},{name:"Status",value:"Pending",inline:true}
  ],footer:{text:"BC Gold Logistics | Human Resources"},timestamp:new Date().toISOString()};
  const posted=await discord("/channels/"+channel.id+"/messages",{method:"POST",body:JSON.stringify({embeds:[embed]})});
  if(!posted.ok){await discord("/channels/"+channel.id,{method:"DELETE"});throw new Error("The ticket was created but its application record could not be posted.");}
  return NextResponse.json({ok:true,number,channelId:channel.id,channelName:channel.name});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Employment application could not be submitted."},{status:500});}
}