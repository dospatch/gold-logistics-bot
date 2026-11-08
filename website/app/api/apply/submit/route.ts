import { NextRequest,NextResponse } from "next/server";
import { getApplicant } from "@/lib/applicant";
export const runtime="nodejs";
const headers=()=>({Authorization:"Bot "+(process.env.DISCORD_TOKEN||""),"Content-Type":"application/json"});
async function discord(path:string,init:RequestInit={}) {
 return fetch("https://discord.com/api/v10"+path,{...init,headers:{...headers(),...(init.headers||{})},cache:"no-store"});
}
export async function POST(request:NextRequest) {
 const applicant=getApplicant(request);
 if(!applicant) return NextResponse.json({error:"Connect your Discord account before submitting."},{status:401});
 if(!process.env.DISCORD_TOKEN||!process.env.GUILD_ID) return NextResponse.json({error:"Application service is not configured."},{status:503});
 try {
  const body=await request.json();
  const games=String(body.games||"").trim(), experience=String(body.experience||"").trim(), availability=String(body.availability||"").trim(), truck=String(body.truck||"").trim(), about=String(body.about||"").trim();
  if(games!=="ATS"||!experience||!availability||!truck||!about||truck.length>100||availability.length>150||[experience,about].some(v=>v.length>1000)) return NextResponse.json({error:"Complete every field using the ATS driver application. Text limits are shown on the form."},{status:400});
  const [channelsResponse,rolesResponse]=await Promise.all([discord("/guilds/"+process.env.GUILD_ID+"/channels"),discord("/guilds/"+process.env.GUILD_ID+"/roles")]);
  if(!channelsResponse.ok||!rolesResponse.ok) throw new Error("The bot cannot read server channels or roles. Check its permissions.");
  const channels=await channelsResponse.json(), roles=await rolesResponse.json();
  const category=channels.find((c:any)=>c.type===4&&c.name==="👥 HUMAN RESOURCES");
  if(!category) throw new Error("The 👥 HUMAN RESOURCES category was not found. Run /setup-company.");
  const staffNames=["Owner","President","Chief Executive Officer","Chief Operating Officer","HR Director","HR Manager","Recruiter"];
  const staffRoles=roles.filter((r:any)=>staffNames.includes(r.name));
  if(!staffRoles.length) throw new Error("No authorized recruitment roles were found. Create or restore an HR Director, HR Manager, or Recruiter role before accepting applications.");
  const overwrites=[
   {id:process.env.GUILD_ID,type:0,deny:"1024"},
   ...staffRoles.map((r:any)=>({id:r.id,type:0,allow:"68608"})),
   {id:applicant.id,type:1,allow:"68608"},
  ];
  const botId=process.env.CLIENT_ID;
  if(botId) overwrites.push({id:botId,type:1,allow:"68608"} as any);
  const existing=channels.filter((c:any)=>c.parent_id===category.id&&c.topic?.startsWith("BCGL_APP|"));
  const number=String(existing.length+1).padStart(4,"0");
  const safeName=(applicant.username||"driver").toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,20)||"driver";
  const created=await discord("/guilds/"+process.env.GUILD_ID+"/channels",{method:"POST",body:JSON.stringify({name:"application-"+number+"-"+safeName,type:0,parent_id:category.id,topic:"BCGL_APP|"+applicant.id+"|"+number+"|Pending",permission_overwrites:overwrites})});
  if(!created.ok) throw new Error("Could not create the private application ticket ("+created.status+").");
  const channel=await created.json();
  const embed={title:"🚛 BC Gold Logistics — Driver Application",color:0xD4AF37,description:"ATS Driver Application #"+number+". Management review is required before company driver access is granted.",fields:[
   {name:"Applicant",value:applicant.globalName+" ( @"+applicant.username+" )\nDiscord ID: "+applicant.id},
   {name:"Game",value:"American Truck Simulator (ATS)",inline:true},{name:"Preferred truck",value:truck,inline:true},
   {name:"Experience",value:experience},{name:"Availability",value:availability},{name:"Why they want to join",value:about},
   {name:"Status",value:"Pending",inline:true}
  ],footer:{text:"Driven by Excellence. United by the Road."},timestamp:new Date().toISOString()};
  const posted=await discord("/channels/"+channel.id+"/messages",{method:"POST",body:JSON.stringify({embeds:[embed]})});
  if(!posted.ok) { await discord("/channels/"+channel.id,{method:"DELETE"}); throw new Error("Ticket was created but the application record could not be posted."); }
  return NextResponse.json({ok:true,number,channelId:channel.id,channelName:channel.name});
 } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Application could not be submitted."},{status:500}); }
}
