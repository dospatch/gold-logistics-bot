const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const data=new SlashCommandBuilder().setName("apply").setDescription("Apply to join BC Gold Logistics.")
.addStringOption(o=>o.setName("games").setDescription("ATS, ETS2, or both").setRequired(true).addChoices({name:"ATS",value:"ATS"},{name:"ETS2",value:"ETS2"},{name:"Both",value:"Both"}))
.addStringOption(o=>o.setName("experience").setDescription("Your trucking experience").setRequired(true))
.addStringOption(o=>o.setName("availability").setDescription("When you are usually available").setRequired(true))
.addStringOption(o=>o.setName("about").setDescription("Why do you want to join?").setRequired(true))
.addStringOption(o=>o.setName("truck").setDescription("Preferred truck (optional)").setRequired(false));
async function execute(i){
 const ch=i.guild.channels.cache.find(c=>c.name==="applications-review"&&c.isTextBased());
 if(!ch)return i.reply({content:"Management needs to run /setup-company first.",ephemeral:true});
 const e=new EmbedBuilder().setColor(0xD4AF37).setTitle("New Driver Application").addFields(
 {name:"Applicant",value:`${i.user.tag} (<@${i.user.id}>)`},{name:"Games",value:i.options.getString("games"),inline:true},
 {name:"Experience",value:i.options.getString("experience")},{name:"Availability",value:i.options.getString("availability")},
 {name:"Preferred truck",value:i.options.getString("truck")||"Not specified"},{name:"Why join?",value:i.options.getString("about")}).setTimestamp();
 await ch.send({embeds:[e]}); await i.reply({content:"Your application was sent to management. Thank you!",ephemeral:true});
}
module.exports={data,execute};
