const {SlashCommandBuilder}=require("discord.js");
const {createEmbed}=require("../lib/embeds");
const AUTHORIZED_ROLES=new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Executive Director","Transportation Director","Dispatch Director","Department Manager","Supervisor","Senior Driver","Driver Trainer","Company Driver","Probationary Driver"]);
const data=new SlashCommandBuilder().setName("delivery").setDescription("Log a completed freight delivery.")
.addStringOption(o=>o.setName("game").setDescription("Game").setRequired(true).addChoices({name:"ATS",value:"ATS"},{name:"ETS2",value:"ETS2"}))
.addStringOption(o=>o.setName("cargo").setDescription("Cargo").setRequired(true))
.addStringOption(o=>o.setName("route").setDescription("Origin to destination").setRequired(true))
.addIntegerOption(o=>o.setName("distance").setDescription("Distance number").setRequired(true).setMinValue(1))\n.addStringOption(o=>o.setName("unit").setDescription("Distance unit").setRequired(true).addChoices({name:"Miles",value:"mi"},{name:"Kilometers",value:"km"}));
async function execute(i){
 const authorized=i.memberPermissions.has("Administrator")||i.member.roles.cache.some(role=>AUTHORIZED_ROLES.has(role.name));
 if(!authorized)return i.reply({content:"Only approved company drivers and management can log deliveries.",ephemeral:true});
 const ch=i.guild.channels.cache.find(c=>c.name==="delivery-logs"&&c.isTextBased());
 if(!ch)return i.reply({content:"The delivery logs channel was not found. Run /setup-company first.",ephemeral:true});
 const e=createEmbed({title:"Delivery Report",fields:[
 {name:"Driver",value:`<@${i.user.id}>`},{name:"Game",value:i.options.getString("game"),inline:true},
 {name:"Cargo",value:i.options.getString("cargo")},{name:"Route",value:i.options.getString("route")},
 {name:"Distance",value:`${i.options.getInteger("distance").toLocaleString()} ${i.options.getString("unit",true)}`}],timestamp:true});
 await ch.send({embeds:[e]});await i.reply({content:"Delivery logged. Good work!",ephemeral:true});
}
module.exports={data,execute};
