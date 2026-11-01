const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
const data=new SlashCommandBuilder().setName("roster").setDescription("View the company driver roster.");
async function execute(i){
 await i.guild.members.fetch();
 const names=["Owner","Chief Executive Officer","Operations Manager","Fleet Manager","Convoy Manager","Senior Driver","Company Driver","Trainee Driver"];
 const lines=names.map(n=>{const r=i.guild.roles.cache.find(x=>x.name===n);return r?`**${n}:** ${r.members.map(m=>m.user.tag).join(", ")||"No members assigned"}`:null;}).filter(Boolean);
 await i.reply({embeds:[new EmbedBuilder().setColor(0xD4AF37).setTitle("BC Gold Logistics Roster").setDescription(lines.join("\n")||"Run /setup-company first.")],ephemeral:true});
}
module.exports={data,execute};
