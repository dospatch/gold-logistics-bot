const {SlashCommandBuilder,PermissionFlagsBits}=require("discord.js");
const {createEmbed}=require("../lib/embeds");
const data=new SlashCommandBuilder().setName("convoy").setDescription("Announce an ATS or ETS2 company convoy.")
.addStringOption(o=>o.setName("game").setDescription("Game").setRequired(true).addChoices({name:"ATS",value:"ATS"},{name:"ETS2",value:"ETS2"}))
.addStringOption(o=>o.setName("date").setDescription("Date/time and timezone").setRequired(true))
.addStringOption(o=>o.setName("route").setDescription("Origin to destination").setRequired(true))
.addStringOption(o=>o.setName("details").setDescription("Meeting point or other details").setRequired(false));
async function execute(i){
 if(!i.memberPermissions.has(PermissionFlagsBits.ManageGuild))return i.reply({content:"Management only.",ephemeral:true});
 const ch=i.guild.channels.cache.find(c=>c.name==="convoy-announcements"&&c.isTextBased());
 if(!ch)return i.reply({content:"Run /setup-company first.",ephemeral:true});
 const e=createEmbed({title:"BC Gold Logistics Convoy",fields:[
 {name:"Game",value:i.options.getString("game"),inline:true},{name:"Date / Time",value:i.options.getString("date")},
 {name:"Route",value:i.options.getString("route")},{name:"Details",value:i.options.getString("details")||"To be announced"}],timestamp:true});
 await ch.send({content:"@here",embeds:[e]});await i.reply({content:"Convoy posted.",ephemeral:true});
}
module.exports={data,execute};
