const {SlashCommandBuilder,PermissionFlagsBits}=require("discord.js");
const {createEmbed}=require("../lib/embeds");
const MANAGEMENT_ROLES=new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Executive Director","Transportation Director","Dispatch Director","Department Manager","Supervisor"]);
const data=new SlashCommandBuilder().setName("convoy").setDescription("Announce an ATS or ETS2 company convoy.")
.addStringOption(o=>o.setName("game").setDescription("Game").setRequired(true).addChoices({name:"ATS",value:"ATS"},{name:"ETS2",value:"ETS2"}))
.addStringOption(o=>o.setName("date").setDescription("Date/time and timezone").setRequired(true))
.addStringOption(o=>o.setName("route").setDescription("Origin to destination").setRequired(true))
.addStringOption(o=>o.setName("details").setDescription("Meeting point or other details").setRequired(false));
async function execute(i){
 const isManager=i.memberPermissions.has(PermissionFlagsBits.Administrator)||i.member.roles.cache.some(role=>MANAGEMENT_ROLES.has(role.name));
 if(!isManager)return i.reply({content:"Management only.",ephemeral:true});
 const ch=i.guild.channels.cache.find(c=>c.name==="company-session-announcements"&&c.isTextBased());
 if(!ch)return i.reply({content:"The company session announcements channel was not found. Run /setup-company first.",ephemeral:true});
 const e=createEmbed({title:"BC Gold Logistics Convoy",fields:[
 {name:"Game",value:i.options.getString("game"),inline:true},{name:"Date / Time",value:i.options.getString("date")},
 {name:"Route",value:i.options.getString("route")},{name:"Details",value:i.options.getString("details")||"To be announced"}],timestamp:true});
 await ch.send({content:"@here",embeds:[e]});await i.reply({content:"Convoy posted in #company-session-announcements.",ephemeral:true});
}
module.exports={data,execute};
