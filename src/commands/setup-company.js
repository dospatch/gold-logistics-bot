const {SlashCommandBuilder,ChannelType,PermissionFlagsBits}=require("discord.js");
const roles=["Owner","Chief Executive Officer","Operations Manager","Fleet Manager","Convoy Manager","Senior Driver","Company Driver","Trainee Driver"];
const layout={
 "📌 INFORMATION":["welcome","announcements","company-information","company-rules","driver-roster"],
 "📝 RECRUITMENT":["apply-to-join","application-status","recruitment-support"],
 "🚛 DRIVER OPERATIONS":["driver-chat","ats-drivers","ets2-drivers","delivery-logs","mileage-reports"],
 "🏁 CONVOY OPERATIONS":["convoy-announcements","convoy-schedule","convoy-media"],
 "🔒 MANAGEMENT":["management-chat","applications-review","staff-reports"],
 "🔊 VOICE":["Driver Lounge","ATS Convoy","ETS2 Convoy","Management"]
};
const data=new SlashCommandBuilder().setName("setup-company").setDescription("Create missing BC Gold Logistics roles and channels; never deletes existing content.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
async function execute(i){
 await i.deferReply({ephemeral:true});
 const g=i.guild, me=await g.members.fetchMe();
 if(!me.permissions.has(PermissionFlagsBits.ManageChannels)||!me.permissions.has(PermissionFlagsBits.ManageRoles)) return i.editReply("I need Manage Channels and Manage Roles. Place my bot role above the company roles and retry.");
 let rc=0,cc=0;
 for(const name of roles) if(!g.roles.cache.some(r=>r.name===name)){await g.roles.create({name,reason:"BC Gold Logistics setup"});rc++;}
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
 await i.editReply(`Setup complete: created ${rc} roles and ${cc} channels. Existing channels/messages were not changed. Management category is private; management role access can be adjusted in Discord.`);
}
module.exports={data,execute};
