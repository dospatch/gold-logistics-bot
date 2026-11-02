const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const roles = [
  ["Owner",0xD4AF37],["President",0xF1C40F],["Chief Executive Officer",0xE5B83B],
  ["Chief Operating Officer",0xE67E22],["Chief Financial Officer",0x16A085],["Executive Director",0xC49A35],
  ["HR Director",0x9B59B6],["Transportation Director",0x2980B9],["Fleet Director",0x3498DB],
  ["Dispatch Director",0x1F8A70],["Business Development Director",0x8E6E53],["Department Manager",0xB8860B],
  ["Supervisor",0xA67C52],["Senior Driver",0x2ECC71],["Driver Trainer",0x27AE60],["Company Driver",0x1ABC9C],
  ["Probationary Driver",0x95A5A6],["Applicant",0x7F8C8D],["LOA",0x5865F2],["Guest",0x777777]
];
const layout = {
  "🏢 CORPORATE HEADQUARTERS": [
    "welcome",
    "company-announcements",
    "company-information",
    "company-handbook",
    "company-rules",
    "company-updates"
  ],
  "👥 HUMAN RESOURCES": [
    "employment-applications",
    "application-status",
    "employee-directory",
    "employee-support",
    "loa-requests",
    "resignation-requests",
    "promotions"
  ],
  "📋 DISPATCH OPERATIONS": [
    "driver-check-in",
    "company-load-board",
    "load-assignments",
    "active-deliveries",
    "delivery-confirmations",
    "dispatch-reports",
    "delivery-logs",
    "mileage-reports"
  ],
  "🚛 BC GOLD FREIGHT": [
    "freight-announcements",
    "freight-dispatch",
    "freight-drivers",
    "ats-drivers",
    "ets2-drivers"
  ],
  "🏗️ BC GOLD HEAVY HAUL": [
    "heavy-haul-announcements",
    "heavy-haul-dispatch",
    "heavy-haul-drivers"
  ],
  "❄️ BC GOLD REFRIGERATED": [
    "reefer-announcements",
    "reefer-dispatch",
    "reefer-drivers"
  ],
  "🚌 BC GOLD PASSENGER TRANSPORT": [
    "passenger-division",
    "bus-fleet",
    "route-development"
  ],
  "🛠️ FLEET MANAGEMENT": [
    "company-fleet",
    "vehicle-assignments",
    "fleet-inspections",
    "maintenance-reports",
    "fleet-purchases"
  ],
  "📊 FINANCE & ADMINISTRATION": [
    "virtual-financial-ledger",
    "company-budget",
    "department-requests"
  ],
  "🔒 EXECUTIVE OFFICE": [
    "executive-office",
    "management-discussions",
    "department-reports",
    "company-strategy",
    "executive-decisions"
  ],
  "🔒 HUMAN RESOURCES STAFF": [
    "hr-staff-chat",
    "applications-review",
    "employee-records",
    "hr-reports"
  ],
  "🔒 DISPATCH STAFF": [
    "dispatch-staff-chat",
    "dispatch-logs",
    "dispatch-planning"
  ],
  "💬 COMPANY COMMUNITY": [
    "general-chat",
    "truck-showcase",
    "company-media",
    "suggestions"
  ],
  "🔊 COMPANY VOICE": [
    "company-operations",
    "ats-company-session",
    "ets2-company-session",
    "freight-dispatch-voice",
    "heavy-haul-operations",
    "refrigerated-operations",
    "passenger-operations",
    "management-meetings",
    "afk"
  ],
  "🎮 COMPANY MULTIPLAYER SESSIONS": [
    "company-session-announcements",
    "company-session-schedule",
    "company-session-media"
  ]
};
const legacyChannelNames = {
  "company-announcements": "announcements",
  "employee-directory": "driver-roster",
  "employment-applications": "apply-to-join",
  "general-chat": "driver-chat",
  "management-discussions": "management-chat",
  "department-reports": "staff-reports",
  "company-session-announcements": "convoy-announcements",
  "company-session-schedule": "convoy-schedule",
  "company-session-media": "convoy-media",
  "company-operations": "Driver Lounge",
  "ats-company-session": "ATS Convoy",
  "ets2-company-session": "ETS2 Convoy",
  "management-meetings": "Management"
};
const privateCategoryRoles = {
  "🔒 EXECUTIVE OFFICE": new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Executive Director"]),
  "🔒 HUMAN RESOURCES STAFF": new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","HR Director"]),
  "🔒 DISPATCH STAFF": new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Transportation Director","Dispatch Director"]),
  "📊 FINANCE & ADMINISTRATION": new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer"])
};
const managementNames = new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Executive Director","HR Director","Transportation Director","Fleet Director","Dispatch Director","Business Development Director","Department Manager","Supervisor"]);
const data = new SlashCommandBuilder().setName("setup-company").setDescription("Create/update BC Gold Logistics corporate roles and channels without deleting existing content.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
async function execute(interaction) {
  await interaction.deferReply({ephemeral:true});
  const guild=interaction.guild, botMember=await guild.members.fetchMe();
  if(!botMember.permissions.has(PermissionFlagsBits.ManageChannels)||!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) return interaction.editReply("I need Manage Channels and Manage Roles. Move my bot role above company roles, then retry.");
  let rolesCreated=0, roleColorsUpdated=0, categoriesCreated=0, channelsCreated=0;
  for(const [name,color] of roles){ let role=guild.roles.cache.find(r=>r.name===name); if(!role){await guild.roles.create({name,color,reason:"BC Gold Logistics corporate rebuild"});rolesCreated++;} else if(role.color!==color){await role.setColor(color,"Apply BC Gold Logistics branding");roleColorsUpdated++;} }
  await guild.roles.fetch(); await guild.channels.fetch();
  const managers=guild.roles.cache.filter(r=>managementNames.has(r.name));
  const botPerms=[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.EmbedLinks,PermissionFlagsBits.ManageChannels];
  for(const [categoryName,channelNames] of Object.entries(layout)){
    const isPrivate=privateCategories.has(categoryName);
    const overwrites=isPrivate?[{id:guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},...managers.map(r=>({id:r.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]})),{id:botMember.id,allow:botPerms}]:[];
    let category=guild.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name===categoryName);
    if(!category){category=await guild.channels.create({name:categoryName,type:ChannelType.GuildCategory,permissionOverwrites:overwrites,reason:"BC Gold Logistics corporate rebuild"});categoriesCreated++;}
    else if(isPrivate){await category.permissionOverwrites.set(overwrites,"Secure BC Gold Logistics staff category");}
    for(const name of channelNames){
      const type=categoryName==="🔊 COMPANY VOICE"?ChannelType.GuildVoice:ChannelType.GuildText;
      let channel=guild.channels.cache.find(c=>c.name===name&&c.type===type);
      if(!channel&&legacyChannelNames[name]) {
        channel=guild.channels.cache.find(c=>c.name===legacyChannelNames[name]&&c.type===type);
        if(channel) await channel.setName(name,"Rename legacy BC Gold Logistics channel");
      }
      if(channel) {
        if(channel.parentId!==category.id) await channel.setParent(category.id,{lockPermissions:true,reason:"Move existing channel into new BC Gold Logistics structure"});
      } else {
        await guild.channels.create({name,type,parent:category.id,reason:"BC Gold Logistics corporate rebuild"});
        channelsCreated++;
      }
    }
  }
  const recruitment=guild.channels.cache.find(c=>c.name==="employment-applications"&&c.isTextBased());
  let panelPosted=false;
  if(recruitment){const recent=await recruitment.messages.fetch({limit:50});const exists=recent.some(m=>m.author.id===interaction.client.user.id&&m.embeds.some(e=>e.title==="Join BC Gold Logistics"));if(!exists){await recruitment.send(require("./apply").buildApplicationPanel());panelPosted=true;}}
  const owner=guild.roles.cache.find(r=>r.name==="Owner");const member=await guild.members.fetch(interaction.user.id);if(owner&&!member.roles.cache.has(owner.id))await member.roles.add(owner,"Administrator ran company setup");
  await interaction.editReply("Corporate setup complete: "+rolesCreated+" roles created, "+roleColorsUpdated+" role colors updated, "+categoriesCreated+" categories created, "+channelsCreated+" channels created. "+(panelPosted?"Recruitment panel posted.":"Recruitment panel checked.")+" Existing channels and messages were not deleted.");
}
module.exports={data,execute};