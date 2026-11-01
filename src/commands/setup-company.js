const {SlashCommandBuilder,ChannelType,PermissionFlagsBits}=require("discord.js");

// Gold/black fleet-inspired colors for every company role.
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
 "🔒 MANAGEMENT":["management-chat","applications-review","staff-reports"],
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
 const owner=g.roles.cache.find(r=>r.name==="Owner");
 for(const [cat,names] of Object.entries(layout)){
  let parent=g.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name===cat);
  if(!parent) parent=await g.channels.create({name:cat,type:ChannelType.GuildCategory,reason:"BC Gold Logistics setup"});
  const overwrites=cat.includes("MANAGEMENT")?[
   {id:g.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
   ...(owner?[{id:owner.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]}]:[]),
   {id:me.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels]}
  ]:[];
  for(const name of names){
   const type=cat==="🔊 VOICE"?ChannelType.GuildVoice:ChannelType.GuildText;
   if(!g.channels.cache.some(c=>c.parentId===parent.id&&c.name===name)){await g.channels.create({name,type,parent:parent.id,permissionOverwrites:overwrites,reason:"BC Gold Logistics setup"});cc++;}
  }
 }
 await i.editReply(`Setup complete: created ${rc} roles, updated ${colors} role colors, and created ${cc} channels. Existing channels/messages were not changed. The Management category remains private; assign yourself the Owner role for access.`);
}
module.exports={data,execute};
