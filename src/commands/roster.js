const {SlashCommandBuilder}=require("discord.js");
const {createEmbed}=require("../lib/embeds");
const data=new SlashCommandBuilder().setName("roster").setDescription("View the company driver roster.");
async function execute(i){
 await i.guild.members.fetch();
 const names=["Owner","Chief Executive Officer","Operations Manager","Fleet Manager","Convoy Manager","Senior Driver","Company Driver","Trainee Driver"];
 const lines=names.map(n=>{const role=i.guild.roles.cache.find(x=>x.name===n);return role?"**"+n+":** "+(role.members.map(m=>m.user.tag).join(", ")||"No members assigned"):null;}).filter(Boolean);
 await i.reply({embeds:[createEmbed({title:"BC Gold Logistics Roster",description:lines.join("\n")||"Run /setup-company first.",timestamp:true})],ephemeral:true});
}
module.exports={data,execute};
