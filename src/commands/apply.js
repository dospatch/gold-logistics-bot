const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const APPLY_URL=(process.env.APPLICATION_URL||"https://bc-gold-logistics-website.vercel.app/careers").replace(/\/$/,"");
const data=new SlashCommandBuilder().setName("apply").setDescription("View BC Gold Logistics driver recruitment information.");
async function execute(interaction){
 const channel=interaction.guild.channels.cache.find(c=>["employment-applications","employee-support"].includes(c.name)&&c.isTextBased());
 if(!channel)return interaction.reply({content:"The recruitment channel was not found. Run /setup-company first.",ephemeral:true});
 const embed=new EmbedBuilder().setColor(0xD4AF37).setTitle("BC Gold Logistics — Driver Recruitment")
 .setDescription("BC Gold Logistics is recruiting drivers for its multiplayer American Truck Simulator virtual trucking company. Company operations use the built-in ATS Convoy mode.")
 .addFields({name:"Company operation",value:"Multiplayer-only VTC • Organized ATS Convoy sessions • Company-managed virtual fleet"},{name:"Customer model",value:"Coordinated multiplayer freight runs and company events."},{name:"Departments",value:"Transportation • Dispatch • Fleet Management • Safety & Training • Human Resources • Convoy Operations • Technology"},{name:"Apply / learn more",value:"Visit the company careers page for recruitment information and approved opportunities."})
 .setFooter({text:"BC Gold Logistics | Multiplayer ATS VTC"});
 const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("View Careers").setStyle(ButtonStyle.Link).setURL(APPLY_URL));
 await channel.send({embeds:[embed],components:[row]});
 await interaction.reply({content:"BC Gold Logistics driver recruitment information has been posted.",ephemeral:true});
}
module.exports={data,execute};
