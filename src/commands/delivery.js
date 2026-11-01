const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const data=new SlashCommandBuilder().setName("delivery").setDescription("Log a completed freight delivery.")
.addStringOption(o=>o.setName("game").setDescription("Game").setRequired(true).addChoices({name:"ATS",value:"ATS"},{name:"ETS2",value:"ETS2"}))
.addStringOption(o=>o.setName("cargo").setDescription("Cargo").setRequired(true))
.addStringOption(o=>o.setName("route").setDescription("Origin to destination").setRequired(true))
.addIntegerOption(o=>o.setName("distance").setDescription("Distance (miles or km)").setRequired(true).setMinValue(1));
async function execute(i){
 const ch=i.guild.channels.cache.find(c=>c.name==="delivery-logs"&&c.isTextBased());
 if(!ch)return i.reply({content:"Run /setup-company first.",ephemeral:true});
 const e=new EmbedBuilder().setColor(0xD4AF37).setTitle("Delivery Report").addFields(
 {name:"Driver",value:`<@${i.user.id}>`},{name:"Game",value:i.options.getString("game"),inline:true},
 {name:"Cargo",value:i.options.getString("cargo")},{name:"Route",value:i.options.getString("route")},
 {name:"Distance",value:`${i.options.getInteger("distance").toLocaleString()} (miles/km)`}).setTimestamp();
 await ch.send({embeds:[e]});await i.reply({content:"Delivery logged. Good work!",ephemeral:true});
}
module.exports={data,execute};
