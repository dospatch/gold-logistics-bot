const {SlashCommandBuilder}=require("discord.js");
const {createEmbed}=require("../lib/embeds");
const data=new SlashCommandBuilder().setName("roster").setDescription("View the company driver and management roster.");
async function execute(i){
 await i.guild.members.fetch();
 const names=["Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Executive Director","Transportation Director","Dispatch Director","Department Manager","Supervisor","Senior Driver","Driver Trainer","Company Driver","Probationary Driver"];
 const lines=names.map(n=>{const role=i.guild.roles.cache.find(x=>x.name===n);return role?"**"+n+":** "+(role.members.map(m=>m.user.tag).join(", ")||"No members assigned"):null;}).filter(Boolean);
 await i.reply({embeds:[createEmbed({title:"BC Gold Logistics Company Roster",description:lines.join("\n")||"Run /setup-company first.",timestamp:true})],ephemeral:true});
}
module.exports={data,execute};
