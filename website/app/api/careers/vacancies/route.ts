import { NextRequest, NextResponse } from "next/server";
import { discordApi, requireManager } from "@/lib/management";

export const runtime = "nodejs";
const EDITOR_ROLES = ["Owner", "President", "Chief Executive Officer", "Chief Operating Officer", "HR Director", "HR Manager"];
const CHANNEL_TOPIC = "BCGL_VACANCY_STORE";
const MARKER = "BCGL_VACANCY|";
type Vacancy = { id:string; title:string; department:string; location:string; employmentType:string; schedule:string; summary:string; qualifications:string; responsibilities:string; status:"Draft"|"Published"|"Closed"; updatedAt:string };

async function authorized(request:NextRequest) {
  const result = await requireManager(request);
  if (!result.session) return { session:null, response:result.response };
  if (!result.session.roles.some(role => EDITOR_ROLES.includes(role))) {
    return { session:null, response:NextResponse.json({error:"Careers editor access is limited to company leadership and Human Resources."},{status:403}) };
  }
  return { session:result.session, response:null };
}
async function getStore(create=false) {
  const guild = process.env.GUILD_ID;
  if (!guild) throw new Error("GUILD_ID is not configured.");
  const list = await discordApi("/guilds/"+guild+"/channels");
  if (!list.ok) throw new Error("Could not read company Discord channels.");
  const channels = await list.json();
  let store = channels.find((c:any)=>c.type===0 && String(c.topic||"").startsWith(CHANNEL_TOPIC));
  if (store || !create) return store || null;
  const hr = channels.find((c:any)=>c.type===4 && c.name==="👥 HUMAN RESOURCES");
  if (!hr) throw new Error("The 👥 HUMAN RESOURCES category was not found. Run /setup-company first.");
  const made = await discordApi("/guilds/"+guild+"/channels",{method:"POST",body:JSON.stringify({name:"careers-openings",type:0,parent_id:hr.id,topic:CHANNEL_TOPIC+"|Private management vacancy records"})});
  if (!made.ok) throw new Error("Could not create the private careers records channel. Check the bot's Manage Channels permission.");
  store = await made.json();
  return store;
}
function field(embed:any,name:string) { return String(embed?.fields?.find((f:any)=>f.name===name)?.value||""); }
function parse(message:any):Vacancy|null {
  if (!String(message.content||"").startsWith(MARKER)) return null;
  const embed=message.embeds?.[0]; if(!embed) return null;
  const status=field(embed,"Status");
  if(!["Draft","Published","Closed"].includes(status)) return null;
  return {id:message.id,title:String(embed.title||""),department:field(embed,"Department"),location:field(embed,"Location"),employmentType:field(embed,"Employment type"),schedule:field(embed,"Schedule"),summary:field(embed,"Overview"),qualifications:field(embed,"Qualifications"),responsibilities:field(embed,"Responsibilities"),status:status as Vacancy["status"],updatedAt:message.edited_timestamp||message.timestamp};
}
async function records(store:any) {
  const response=await discordApi("/channels/"+store.id+"/messages?limit=100");
  if(!response.ok) throw new Error("Could not load vacancy records from Discord.");
  const messages=await response.json();
  return messages.map(parse).filter(Boolean) as Vacancy[];
}
function clean(value:any,max:number,required=false) {
  const result=String(value??"").trim().replace(/@everyone|@here/g,"").slice(0,max);
  if(required&&!result) throw new Error("Complete all required vacancy fields.");
  return result;
}
function makeEmbed(v:any,editor:string) {
  const status=v.status;
  return {title:v.title,color:status==="Published"?0xD4AF37:status==="Closed"?0x777777:0x5865F2,description:v.summary,fields:[
    {name:"Department",value:v.department,inline:true},{name:"Location",value:v.location||"Not specified",inline:true},
    {name:"Employment type",value:v.employmentType,inline:true},{name:"Schedule",value:v.schedule||"To be confirmed",inline:true},
    {name:"Qualifications",value:v.qualifications||"To be confirmed"},{name:"Responsibilities",value:v.responsibilities||"To be confirmed"},
    {name:"Status",value:status,inline:true},{name:"Last updated by",value:editor,inline:true}
  ],footer:{text:"BC Logistics LLC | Official Careers Vacancy"},timestamp:new Date().toISOString()};
}
function normalize(body:any) {
  const status=String(body.status||"Draft");
  if(!["Draft","Published","Closed"].includes(status)) throw new Error("Choose Draft, Published, or Closed.");
  return {title:clean(body.title,100,true),department:clean(body.department,100,true),location:clean(body.location,100),employmentType:clean(body.employmentType,60,true),schedule:clean(body.schedule,100),summary:clean(body.summary,1000,true),qualifications:clean(body.qualifications,1000),responsibilities:clean(body.responsibilities,1000),status};
}
export async function GET(request:NextRequest) {
  const manage=request.nextUrl.searchParams.get("manage")==="1";
  if(manage){const auth=await authorized(request);if(!auth.session)return auth.response!;}
  try {
    const store=await getStore(false);
    if(!store)return NextResponse.json({vacancies:[]},{headers:{"Cache-Control":"no-store"}});
    const vacancies=await records(store);
    const visible=manage?vacancies:vacancies.filter(v=>v.status==="Published");
    visible.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json({vacancies:visible},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Could not load vacancies."},{status:500}); }
}
export async function POST(request:NextRequest) {
  const auth=await authorized(request);if(!auth.session)return auth.response!;
  try {
    const body=normalize(await request.json());
    const store=await getStore(true);
    const embed=makeEmbed(body,auth.session.username);
    const result=await discordApi("/channels/"+store.id+"/messages",{method:"POST",body:JSON.stringify({content:MARKER+"new|"+body.status,embeds:[embed],allowed_mentions:{parse:[]}})});
    if(!result.ok)throw new Error("Could not save the vacancy in the private Discord records channel.");
    const message=await result.json();
    await discordApi("/channels/"+store.id+"/messages/"+message.id,{method:"PATCH",body:JSON.stringify({content:MARKER+message.id+"|"+body.status})});
    return NextResponse.json({ok:true,id:message.id},{status:201});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Could not save vacancy."},{status:400}); }
}
export async function PATCH(request:NextRequest) {
  const auth=await authorized(request);if(!auth.session)return auth.response!;
  try {
    const body=await request.json(),id=String(body.id||"");
    if(!/^\d{17,20}$/.test(id))return NextResponse.json({error:"Invalid vacancy record."},{status:400});
    const vacancy=normalize(body),store=await getStore(false);
    if(!store)return NextResponse.json({error:"Vacancy records were not found."},{status:404});
    const response=await discordApi("/channels/"+store.id+"/messages/"+id);
    if(!response.ok)return NextResponse.json({error:"Vacancy record was not found."},{status:404});
    const existing=await response.json();
    if(!String(existing.content||"").startsWith(MARKER))return NextResponse.json({error:"This record is not a careers vacancy."},{status:403});
    const saved=await discordApi("/channels/"+store.id+"/messages/"+id,{method:"PATCH",body:JSON.stringify({content:MARKER+id+"|"+vacancy.status,embeds:[makeEmbed(vacancy,auth.session!.username)],allowed_mentions:{parse:[]}})});
    if(!saved.ok)throw new Error("Could not update the vacancy.");
    return NextResponse.json({ok:true,id});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Could not update vacancy."},{status:400}); }
}
