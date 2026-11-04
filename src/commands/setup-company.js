const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const roles = [
 ["Owner",0xD4AF37],["President",0xF1C40F],["Chief Executive Officer",0xE5B83B],["Chief Operating Officer",0xE67E22],["Chief Financial Officer",0x16A085],["Executive Director",0xC49A35],
 ["HR Director",0x9B59B6],["Transportation Director",0x2980B9],["Fleet Director",0x3498DB],["Dispatch Director",0x1F8A70],["Warehouse Director",0xB8860B],["Carrier Services Director",0x8E6E53],["Safety & Compliance Director",0xC0392B],["Security Director",0x34495E],["Finance Director",0x16A085],["IT & Facilities Director",0x7F8C8D],
 ["Department Manager",0xB8860B],["Shift Manager",0xA67C52],["Supervisor",0xA67C52],["Dispatcher",0x1F8A70],["Company Driver",0x1ABC9C],["Warehouse Associate",0x2ECC71],["Forklift Operator",0x27AE60],["Diesel Technician",0x3498DB],["Safety Officer",0xC0392B],["Security Officer",0x34495E],["Carrier Partner",0x95A5A6],["Applicant",0x7F8C8D],["Employee",0x2ECC71],["Guest",0x777777],
 // Preserve legacy VTC role names so existing members and permissions are not disrupted.
 ["Senior Driver",0x2ECC71],["Driver Trainer",0x27AE60],["Probationary Driver",0x95A5A6],["LOA",0x5865F2]
];
const layout = {
 "🏢 CORPORATE HEADQUARTERS":["welcome","company-announcements","company-information","company-handbook","company-rules","company-updates"],
 "👥 HUMAN RESOURCES":["employment-applications","employee-directory","employee-support","onboarding","training","loa-requests","promotions"],
 "🚛 TRANSPORTATION & FLEET":["driver-check-in","company-fleet","vehicle-assignments","fleet-inspections","maintenance-reports","fuel-reports"],
 "📋 DISPATCH & LOAD PLANNING":["wholesale-load-board","load-assignments","active-shipments","delivery-confirmations","dispatch-reports","appointment-schedule"],
 "🏭 DISTRIBUTION CENTER":["warehouse-operations","inbound-receiving","outbound-shipping","dock-schedule","inventory-control","cross-dock","cold-storage"],
 "🏢 WHOLESALE CUSTOMER SERVICES":["wholesale-accounts","customer-support","shipment-inquiries","freight-claims"],
 "🤝 CARRIER SERVICES":["carrier-registration","carrier-check-in","carrier-appointments","carrier-staging","carrier-notices"],
 "🦺 SAFETY & COMPLIANCE":["safety-reports","incident-reports","compliance-updates","training-records"],
 "🔐 FACILITY SECURITY":["security-operations","gate-reports","access-issues","emergency-coordination"],
 "📊 FINANCE & ADMINISTRATION":["payroll-support","procurement","invoices","company-budget","department-requests"],
 "🔒 EXECUTIVE OFFICE":["executive-office","management-discussions","department-reports","company-strategy","executive-decisions"],
 "🔒 HR STAFF":["hr-staff-chat","applications-review","employee-records","hr-reports"],
 "🔒 DISPATCH & WAREHOUSE LEADERSHIP":["dispatch-staff-chat","dispatch-logs","warehouse-leadership","shift-reports"],
 "🔒 SAFETY & FINANCE STAFF":["safety-leadership","incident-review","finance-staff","payroll-records"],
 "💬 COMPANY COMMUNITY":["general-chat","company-media","suggestions"],
 "🔊 COMPANY VOICE":["company-operations","dispatch-voice","warehouse-operations-voice","management-meetings","afk"],
 // Retain the former virtual trucking channels; do not delete or rename their history.
 "🚚 LEGACY VTC & SIMULATOR COMMUNITY":["ats-drivers","ets2-drivers","ats-company-session","ets2-company-session","company-session-announcements","company-session-schedule","company-session-media","truck-showcase","convoy-announcements","convoy-schedule"]
};
const management = new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Executive Director","HR Director","Transportation Director","Fleet Director","Dispatch Director","Warehouse Director","Carrier Services Director","Safety & Compliance Director","Security Director","Finance Director","IT & Facilities Director","Department Manager","Shift Manager","Supervisor"]);
const privateRoles = {
 "🔒 EXECUTIVE OFFICE":new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Executive Director"]),
 "🔒 HR STAFF":new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","HR Director"]),
 "🔒 DISPATCH & WAREHOUSE LEADERSHIP":new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Transportation Director","Dispatch Director","Warehouse Director","Department Manager","Shift Manager"]),
 "🔒 SAFETY & FINANCE STAFF":new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Safety & Compliance Director","Finance Director"])
};
const data = new SlashCommandBuilder().setName("setup-company").setDescription("Create/update BC Logistics LLC company roles and channels without deleting existing content.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
async function execute(interaction) {
 await interaction.deferReply({ephemeral:true});
 const guild=interaction.guild, botMember=await guild.members.fetchMe();
 if(!botMember.permissions.has(PermissionFlagsBits.ManageChannels)||!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) return interaction.editReply("I need Manage Channels and Manage Roles. Move my bot role above company roles, then retry.");
 let rolesCreated=0,roleColorsUpdated=0,categoriesCreated=0,channelsCreated=0;
 for(const [name,color] of roles){let role=guild.roles.cache.find(r=>r.name===name);if(!role){await guild.roles.create({name,color,reason:"BC Logistics LLC company setup"});rolesCreated++;}else if(role.color!==color){await role.setColor(color,"Apply BC Logistics LLC role colors");roleColorsUpdated++;}}
 await guild.roles.fetch();await guild.channels.fetch();
 const botPerms=[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.EmbedLinks,PermissionFlagsBits.ManageChannels];
 for(const [categoryName,channelNames] of Object.entries(layout)){
  const allowed=privateRoles[categoryName],isPrivate=Boolean(allowed);
  const overwrites=isPrivate?[{id:guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},...guild.roles.cache.filter(r=>allowed.has(r.name)).map(r=>({id:r.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]})),{id:botMember.id,allow:botPerms}]:[];
  let category=guild.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name===categoryName);
  if(!category){category=await guild.channels.create({name:categoryName,type:ChannelType.GuildCategory,permissionOverwrites:overwrites,reason:"BC Logistics LLC company setup"});categoriesCreated++;}
  else if(isPrivate) await category.permissionOverwrites.set(overwrites,"Secure BC Logistics LLC staff category");
  for(const name of channelNames){
   const type=categoryName==="🔊 COMPANY VOICE"?ChannelType.GuildVoice:ChannelType.GuildText;
   let channel=guild.channels.cache.find(c=>c.name===name&&c.type===type);
   if(channel){if(channel.parentId!==category.id)await channel.setParent(category.id,{lockPermissions:true,reason:"Organize BC Logistics LLC channels"});}
   else {await guild.channels.create({name,type,parent:category.id,reason:"BC Logistics LLC company setup"});channelsCreated++;}
  }
 }
 const owner=guild.roles.cache.find(r=>r.name==="Owner"),member=await guild.members.fetch(interaction.user.id);
 if(owner&&!member.roles.cache.has(owner.id))await member.roles.add(owner,"Administrator ran company setup");
 await interaction.editReply("BC Logistics LLC setup complete: "+rolesCreated+" roles created, "+roleColorsUpdated+" role colors updated, "+categoriesCreated+" categories created, "+channelsCreated+" channels created. Existing channels and messages were preserved. Review private-channel role assignments before inviting employees or carriers.");
}
module.exports={data,execute};
