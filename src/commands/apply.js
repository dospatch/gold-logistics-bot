const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const APPLY_URL = (process.env.APPLICATION_URL || "https://bc-gold-logistics-website.vercel.app/apply").replace(/\/$/, "");
const APPLY_BUTTON_ID = "bcgold_apply_start";
const data = new SlashCommandBuilder().setName("apply").setDescription("Post the BC Gold Logistics employment application panel.");
async function execute(interaction) {
  const channel=interaction.guild.channels.cache.find(c=>["employment-applications","apply-to-join"].includes(c.name)&&c.isTextBased());
  if(!channel)return interaction.reply({content:"The recruitment channel was not found. Run /setup-company first.",ephemeral:true});
  await channel.send(buildApplicationPanel());
  await interaction.reply({content:"The BC Gold Logistics recruitment panel has been posted.",ephemeral:true});
}
function buildApplicationPanel() {
  const embed=new EmbedBuilder().setColor(0xD4AF37).setTitle("🚛 Join BC Gold Logistics").setDescription("Build your future with an independent virtual transportation company operating in ATS and ETS2 multiplayer.").addFields(
    {name:"Company divisions",value:"Freight • Heavy Haul • Refrigerated • Fleet Services • Future Passenger Transport"},
    {name:"How to apply",value:"Click **Start Your Application** to connect your Discord account and complete the company application."},
    {name:"What happens next?",value:"Authorized company staff will review your application and provide your next steps."}
  ).setFooter({text:"Driven by Excellence. Delivered with Pride."});
  const button=new ButtonBuilder().setLabel("Start Your Application").setStyle(ButtonStyle.Link).setURL(APPLY_URL).setEmoji("🚛");
  return {embeds:[embed],components:[new ActionRowBuilder().addComponents(button)]};
}
async function handleButton(interaction){if(interaction.customId!==APPLY_BUTTON_ID)return false;const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Open Website Application").setStyle(ButtonStyle.Link).setURL(APPLY_URL));await interaction.reply({content:"Applications are completed on the BC Gold Logistics website. Use the button below.",components:[row],ephemeral:true});return true;}
module.exports={data,execute,buildApplicationPanel,APPLY_BUTTON_ID,handleButton};