const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require("discord.js");

const APPLY_URL = (process.env.APPLICATION_URL || "https://bc-gold-logistics-website-dospatchs-projects.vercel.app/apply").replace(/\/$/, "");
const APPLY_BUTTON_ID = "bcgold_apply_start";

const data = new SlashCommandBuilder()
  .setName("apply")
  .setDescription("Post the BC Gold Logistics application panel.");

async function execute(i) {
  const channel = i.guild.channels.cache.find(c => c.name === "apply-to-join" && c.isTextBased());
  if (!channel) return i.reply({ content: "The #apply-to-join channel was not found. Run /setup-company first.", ephemeral: true });
  await channel.send(buildApplicationPanel());
  await i.reply({ content: "The application panel has been posted in #apply-to-join.", ephemeral: true });
}

function buildApplicationPanel() {
  const embed = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle("🚛 Join BC Gold Logistics")
    .setDescription("Ready to hit the road with us? We welcome ATS and ETS2 drivers who value teamwork, professionalism, and safe driving.")
    .addFields(
      { name: "How to apply", value: "Click **Start Your Application** to securely connect your Discord account and complete the application on our company website." },
      { name: "What happens next?", value: "A private application ticket will be created for you and authorized staff. Management reviews your application on the website." }
    )
    .setFooter({ text: "Driven by Excellence. United by the Road." });

  const button = new ButtonBuilder()
    .setLabel("Start Your Application")
    .setStyle(ButtonStyle.Link)
    .setURL(APPLY_URL)
    .setEmoji("🚛");

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] };
}

module.exports = { data, execute, buildApplicationPanel, APPLY_BUTTON_ID };
