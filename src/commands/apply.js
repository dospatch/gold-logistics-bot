const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const APPLY_URL=(process.env.APPLICATION_URL||"https://bc-gold-logistics-website.vercel.app/careers").replace(/\/$/,"");
const data=new SlashCommandBuilder().setName("apply").setDescription("View BC Logistics LLC career and recruitment information.");
async function execute(interaction){
 const channel=interaction.guild.channels.cache.find(c=>["employment-applications","employee-support"].includes(c.name)&&c.isTextBased());
 if(!channel)return interaction.reply({content:"The Human Resources channel was not found. Run /setup-company first.",ephemeral:true});
 const embed=new EmbedBuilder().setColor(0xD4AF37).setTitle("BC Logistics LLC — Careers & Recruitment")
 .setDescription("BC Logistics LLC is planning a workforce capacity of 600+ employees across transportation, dispatch, wholesale distribution, fleet maintenance, safety, security, and corporate support.")
 .addFields({name:"Company scale",value:"300+ truck fleet capacity • 600+ employee planning capacity • 24/7 distribution center"},{name:"Customer model",value:"Wholesale and business-to-business customers only."},{name:"Departments",value:"Transportation • Dispatch • Warehouse • Maintenance • Safety & Compliance • Security • HR • Finance • IT & Facilities"},{name:"Apply / learn more",value:"Visit the company careers page for recruitment information and approved opportunities."})
 .setFooter({text:"BC Logistics LLC | Regional Transportation & Distribution"});
 const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("View Careers").setStyle(ButtonStyle.Link).setURL(APPLY_URL));
 await channel.send({embeds:[embed],components:[row]});
 await interaction.reply({content:"BC Logistics LLC careers information has been posted in the Human Resources channel.",ephemeral:true});
}
module.exports={data,execute};
