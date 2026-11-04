const {SlashCommandBuilder,ChannelType,PermissionFlagsBits,EmbedBuilder}=require("discord.js");
const {createEmbed}=require("../lib/embeds");
const STAFF=new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Carrier Services Director","Carrier Relations Coordinator","Dispatch Director","Dispatch Supervisor"]);
const data=new SlashCommandBuilder().setName("carrier-register").setDescription("Submit an outside-carrier partner registration request.")
.addStringOption(o=>o.setName("company").setDescription("Carrier legal or operating name").setRequired(true).setMaxLength(100))
.addStringOption(o=>o.setName("equipment").setDescription("Equipment types operated").setRequired(true).setMaxLength(150))
.addStringOption(o=>o.setName("service-area").setDescription("States or regions served").setRequired(true).setMaxLength(150))
.addStringOption(o=>o.setName("dot-mc").setDescription("USDOT or MC identifier, if applicable").setRequired(false).setMaxLength(50))
.addBooleanOption(o=>o.setName("insurance-ready").setDescription("Can provide current insurance documents when requested?").setRequired(true));
async function execute(i){
 await i.deferReply({ephemeral:true});
 const guild=i.guild,category=guild.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name==="🤝 CARRIER SERVICES");
 if(!category)return i.editReply("The Carrier Services category was not found. Run /setup-company first.");
 const safe=i.options.getString("company",true).toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,18)||"carrier";
 const existing=guild.channels.cache.find(c=>c.parentId===category.id&&c.topic?.startsWith("BCGL_CARRIER|"+i.user.id+"|Pending"));
 if(existing)return i.editReply("You already have an open carrier registration ticket: <#"+existing.id+">.");
 const roles=guild.roles.cache.filter(r=>STAFF.has(r.name));
 const overwrites=[{id:guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},...roles.map(r=>({id:r.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles]})),{id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles]},{id:(await guild.members.fetchMe()).id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels]}];
 const ticket=await guild.channels.create({name:"carrier-"+safe+"-"+i.user.username.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,6),type:ChannelType.GuildText,parent:category.id,topic:"BCGL_CARRIER|"+i.user.id+"|Pending",permissionOverwrites:overwrites,reason:"Outside carrier registration request"});
 const embed=createEmbed({title:"🤝 Outside Carrier Registration",description:"This is a partner application, not an employee application. Approval is required before freight access is granted.",fields:[
 {name:"Applicant",value:"<@"+i.user.id+">"},{name:"Carrier company",value:i.options.getString("company",true)},
 {name:"Equipment",value:i.options.getString("equipment",true)},{name:"Service area",value:i.options.getString("service-area",true)},
 {name:"USDOT / MC",value:i.options.getString("dot-mc")||"Not provided"},{name:"Insurance documentation",value:i.options.getBoolean("insurance-ready",true)?"Can provide current proof when requested":"Not confirmed"},
 {name:"Status",value:"Pending"}
 ],timestamp:true});
 await ticket.send({content:roles.map(r=>"<@&"+r.id+">").join(" "),embeds:[embed],allowedMentions:{roles:roles.map(r=>r.id)}});
 return i.editReply("Carrier registration submitted privately. Your request is in <#"+ticket.id+">. You are not yet approved as a freight partner.");
}
module.exports={data,execute};