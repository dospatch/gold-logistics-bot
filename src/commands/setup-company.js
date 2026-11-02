const {SlashCommandBuilder,ChannelType,PermissionFlagsBits}=require("discord.js");
const {buildApplicationPanel,APPLY_BUTTON_ID}=require("./apply");

const roles=[
 {name:"Owner",color:0xD4AF37},
 {name:"Chief Executive Officer",color:0xF1C40F},
 {name:"Operations Manager",color:0xE67E22},
 {name:"Fleet Manager",color:0x3498DB},
 {name:"Convoy Manager",color:0x9B59B6},
 {name:"Senior Driver",color:0x2ECC71},
 {name:"Company Driver",color:0x1ABC9C},
 {name:"Trainee Driver",color:0x95A5A6}
];
const layout={
 "📌 INFORMATION":["welcome","announcements","company-information","company-rules","driver-roster"],
 "📝 RECRUITMENT":["apply-to-join","application-status","recruitment-support"],
 "🚛 DRIVER OPERATIONS":["driver-chat","ats-drivers","ets2-drivers","delivery-logs","mileage-reports"],
 "🏁 CONVOY OPERATIONS":["convoy-announcements","convoy-schedule","convoy-media"],
 "🔒 MANAGEMENT":["management-chat","staff-reports"],
 "🔊 VOICE":["Driver Lounge","ATS Convoy","ETS2 Convoy","Management"]
};
const data=new SlashCommandBuilder().setName("setup-company").setDescription("Create/update BC Gold Logistics roles and channels; never deletes existing content.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function execute(i){
 await i.deferReply({ephemeral:true});
 const g=i.guild, me=await g.members.fetchMe();
 if(!me.permissions.has(PermissionFlagsBits.ManageChannels)||!me.permissions.has(PermissionFlagsBits.ManageRoles)) return i.editReply("I need Manage Channels and Manage Roles. Place my bot role above the company roles and retry.");

 let rc=0,colors=0,cc=0;
 for(const roleInfo of roles){
  let role=g.roles.cache.find(r=>r.name===roleInfo.name);
  if(!role){role=await g.roles.create({name:roleInfo.name,color:roleInfo.color,reason:"BC Gold Logistics setup"});rc++;}
  else if(role.color!==roleInfo.color){await role.setColor(roleInfo.color,"Apply BC Gold Logistics role colors");colors++;}
 }

 const managementRoles=roles.filter(r=>["Owner","Chief Executive Officer","Operations Manager","Fleet Manager"].includes(r.name)).map(info=>g.roles.cache.find(existing=>existing.name===info.name)).filter(Boolean);
 for(const [cat,names] of Object.entries(layout)){
  let parent=g.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name===cat);
  if(!parent) parent=await g.channels.create({name:cat,type:ChannelType.GuildCategory,reason:"BC Gold Logistics setup"});
  const overwrites=cat.includes("MANAGEMENT")?[
   {id:g.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
   ...managementRoles.map(role=>({id:role.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]})),
   {id:me.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels]}
  ]:[];
  for(const name of names){
   const type=cat==="🔊 VOICE"?ChannelType.GuildVoice:ChannelType.GuildText;
   if(!g.channels.cache.some(c=>c.parentId===parent.id&&c.name===name)){
    await g.channels.create({name,type,parent:parent.id,permissionOverwrites:overwrites,reason:"BC Gold Logistics setup"});
    cc++;
   }
  }
  if(cat.includes("MANAGEMENT")){
   await parent.permissionOverwrites.edit(g.roles.everyone,{ViewChannel:false});
   for(const role of managementRoles) await parent.permissionOverwrites.edit(role,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true});
   await parent.permissionOverwrites.edit(me,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true,ManageChannels:true});
  }
 }

 const applyChannel=g.channels.cache.find(c=>c.name==="apply-to-join"&&c.isTextBased());
 let panelCreated=false;
 if(applyChannel){
  const recent=await applyChannel.messages.fetch({limit:50});
  const panelExists=recent.some(message=>message.components.some(row=>row.components.some(component=>component.url?.includes("/apply"))));
  if(!panelExists){await applyChannel.send(buildApplicationPanel());panelCreated=true;}
 }

 const owner=g.roles.cache.find(r=>r.name==="Owner");
 if(owner && !i.member.roles.cache.has(owner.id)){
  const invoker=await g.members.fetch(i.user.id);
  await invoker.roles.add(owner,"Administrator ran BC Gold Logistics initial setup");
 }

 await i.editReply("Setup complete: created " + rc + " roles, updated " + colors + " role colors, created " + cc + " channels, and " + (panelCreated?"posted":"checked") + " the application panel. Existing channels/messages were not deleted.");
}
module.exports={data,execute};
