const {SlashCommandBuilder,PermissionFlagsBits}=require("discord.js");
function command(name,approved){return {data:new SlashCommandBuilder().setName(name).setDescription(approved?"Approve a driver application":"Decline a driver application").addUserOption(o=>o.setName("driver").setDescription("Applicant").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),async execute(i){
 const user=i.options.getUser("driver"),member=await i.guild.members.fetch(user.id);
 if(approved){const role=i.guild.roles.cache.find(r=>r.name==="Trainee Driver");if(!role)return i.reply({content:"Run /setup-company first.",ephemeral:true});await member.roles.add(role);}
 const ch=i.guild.channels.cache.find(c=>c.name==="application-status"&&c.isTextBased());
 if(ch)await ch.send(`${approved?"✅ Approved":"❌ Declined"}: <@${user.id}> — reviewed by <@${i.user.id}>.`);
 await i.reply({content:`${user.tag} ${approved?"approved and assigned Trainee Driver":"declined"}.`,ephemeral:true});
}};}
module.exports={approve:command("approve",true),deny:command("deny",false)};
