const {SlashCommandBuilder,PermissionFlagsBits,EmbedBuilder}=require("discord.js");
const {createEmbed}=require("../lib/embeds");
const STAFF=new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Carrier Services Director","Carrier Relations Coordinator"]);
const data=new SlashCommandBuilder().setName("carrier-review").setDescription("Approve or decline an outside carrier registration.")
.addUserOption(o=>o.setName("applicant").setDescription("Carrier applicant").setRequired(true))
.addStringOption(o=>o.setName("decision").setDescription("Review decision").setRequired(true).addChoices({name:"Approve partner",value:"approve"},{name:"Decline",value:"decline"}))
.addStringOption(o=>o.setName("notes").setDescription("Optional review note").setRequired(false).setMaxLength(500));
async function execute(i){
 if(!i.memberPermissions.has(PermissionFlagsBits.Administrator)&&!i.member.roles.cache.some(r=>STAFF.has(r.name)))return i.reply({content:"Carrier Services management only.",ephemeral:true});
 await i.deferReply({ephemeral:true});
 const applicant=i.options.getUser("applicant",true),ticket=i.guild.channels.cache.find(c=>c.topic?.startsWith("BCGL_CARRIER|"+applicant.id+"|Pending"));
 if(!ticket)return i.editReply("No pending carrier registration ticket was found for that applicant.");
 const approved=i.options.getString("decision")==="approve",status=approved?"Approved":"Declined";
 if(approved){const role=i.guild.roles.cache.find(r=>r.name==="Carrier Partner");if(!role)return i.editReply("The Carrier Partner role is missing. Run /setup-company.");await (await i.guild.members.fetch(applicant.id)).roles.add(role,"Carrier registration approved");}
 await ticket.setTopic("BCGL_CARRIER|"+applicant.id+"|"+status);
 const messages=await ticket.messages.fetch({limit:20}),original=messages.find(m=>m.embeds.some(e=>e.title==="🤝 Outside Carrier Registration"));
 if(original){const embed=EmbedBuilder.from(original.embeds[0]),fields=embed.data.fields||[],field=fields.find(f=>f.name==="Status");if(field)field.value=status+(i.options.getString("notes")?" — "+i.options.getString("notes"):"");await original.edit({embeds:[embed.setColor(approved?0x2ECC71:0xE74C3C).setFields(fields).setTimestamp()]});}
 await ticket.send(approved?"✅ Carrier partner registration approved. The Carrier Partner role has been assigned.":"❌ Carrier partner registration declined. Contact Carrier Services if you have questions.");
 return i.editReply("Carrier registration marked **"+status+"**.");
}
module.exports={data,execute};