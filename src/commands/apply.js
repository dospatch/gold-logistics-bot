const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const data=new SlashCommandBuilder().setName("apply").setDescription("Submit a private BC Gold Logistics driver application.")
.addStringOption(o=>o.setName("games").setDescription("ATS, ETS2, or both").setRequired(true).addChoices({name:"ATS",value:"ATS"},{name:"ETS2",value:"ETS2"},{name:"Both",value:"Both"}))
.addStringOption(o=>o.setName("experience").setDescription("Your trucking experience").setRequired(true))
.addStringOption(o=>o.setName("availability").setDescription("When you are usually available").setRequired(true))
.addStringOption(o=>o.setName("about").setDescription("Why do you want to join?").setRequired(true))
.addStringOption(o=>o.setName("truck").setDescription("Preferred truck (optional)").setRequired(false));
async function execute(i){
 await i.deferReply({ephemeral:true});
 const ch=i.guild.channels.cache.find(c=>c.name==="applications-review"&&c.isTextBased());
 if(!ch)return i.editReply("Management needs to run /setup-company first.");
 const answers={
  games:i.options.getString("games"),
  experience:i.options.getString("experience"),
  availability:i.options.getString("availability"),
  about:i.options.getString("about"),
  truck:i.options.getString("truck")||"Not specified"
 };
 const applicationEmbed=new EmbedBuilder().setColor(0xD4AF37).setTitle("🚛 BC Gold Logistics — Driver Application")
  .setDescription("A new driver application has been submitted for management review.")
  .addFields(
   {name:"Applicant",value:`${i.user.tag} (<@ ${i.user.id}>)`.replace("<@ ","<@")},
   {name:"Game",value:answers.games,inline:true},
   {name:"Preferred truck",value:answers.truck,inline:true},
   {name:"Trucking experience",value:answers.experience},
   {name:"Availability",value:answers.availability},
   {name:"Why do you want to join?",value:answers.about}
  ).setFooter({text:"BC Gold Logistics • Recruitment"}).setTimestamp();
 await ch.send({embeds:[applicationEmbed]});
 const dmEmbed=new EmbedBuilder().setColor(0xD4AF37).setTitle("✅ Application received")
  .setDescription("Thank you for applying to BC Gold Logistics! Your driver application has been delivered privately to company management. We will contact you when it has been reviewed.")
  .addFields({name:"Game",value:answers.games,inline:true},{name:"Preferred truck",value:answers.truck,inline:true})
  .setFooter({text:"Driven by Excellence. United by the Road."}).setTimestamp();
 try{
  await i.user.send({embeds:[dmEmbed]});
  await i.editReply("Your application was submitted to management. I've also sent you a private DM confirmation.");
 }catch(error){
  if(error.code===50007) await i.editReply("Your application was submitted to management, but I couldn't DM you. Please enable server-member DMs so you can receive application updates.");
  else throw error;
 }
}
module.exports={data,execute};
