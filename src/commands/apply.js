const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits
} = require("discord.js");

const GOLD = 0xD4AF37;
const FOOTER = "Driven by Excellence. United by the Road.";

const data = new SlashCommandBuilder()
  .setName("post-application-panel")
  .setDescription("Post the gold-themed driver application panel.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

async function execute(interaction) {
  const channel = interaction.guild.channels.cache.find(c => c.name === "apply-to-join" && c.isTextBased());
  if (!channel) return interaction.reply({ content: "I couldn't find #apply-to-join. Run /setup-company first.", ephemeral: true });

  const panel = new EmbedBuilder()
    .setColor(GOLD)
    .setTitle("🚛 BC GOLD LOGISTICS | DRIVER RECRUITMENT")
    .setDescription("**Ready to take the wheel with BC Gold Logistics?**\n\nWe welcome ATS and ETS2 drivers who value professionalism, teamwork, and safe miles. Press **Apply Now** below to complete our private application. Your answers will be sent directly to company management.")
    .addFields(
      { name: "Available games", value: "American Truck Simulator • Euro Truck Simulator 2" },
      { name: "Application privacy", value: "Your application is not posted publicly. Management reviews it in a private channel." }
    )
    .setFooter({ text: FOOTER }).setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("gold_apply_start").setLabel("Apply Now").setStyle(ButtonStyle.Primary).setEmoji("📝")
  );
  await channel.send({ embeds: [panel], components: [row] });
  await interaction.reply({ content: "The gold-themed application panel has been posted in #apply-to-join.", ephemeral: true });
}

async function handleButton(interaction) {
  if (interaction.customId !== "gold_apply_start") return false;
  const modal = new ModalBuilder().setCustomId("gold_apply_modal").setTitle("BC Gold Logistics Driver Application");
  const fields = [
    ["games", "Which game? ATS, ETS2, or Both", "ATS / ETS2 / Both", TextInputStyle.Short, 1, 30],
    ["experience", "Your trucking experience", "Experience level and time played", TextInputStyle.Paragraph, 5, 500],
    ["availability", "When are you usually available?", "Days, times, and timezone", TextInputStyle.Paragraph, 2, 300],
    ["truck", "Preferred truck (optional)", "Truck make/model or Not decided", TextInputStyle.Short, 0, 100],
    ["about", "Why join BC Gold Logistics?", "Tell management a little about yourself", TextInputStyle.Paragraph, 10, 700]
  ];
  modal.addComponents(...fields.map(([id, label, placeholder, style, min, max]) =>
    new ActionRowBuilder().addComponents(new TextInputBuilder()
      .setCustomId(id).setLabel(label).setPlaceholder(placeholder).setStyle(style)
      .setRequired(id !== "truck").setMinLength(min).setMaxLength(max))
  ));
  await interaction.showModal(modal);
  return true;
}

async function handleModal(interaction) {
  if (interaction.customId !== "gold_apply_modal") return false;
  await interaction.deferReply({ ephemeral: true });

  const answers = {
    games: interaction.fields.getTextInputValue("games").trim(),
    experience: interaction.fields.getTextInputValue("experience").trim(),
    availability: interaction.fields.getTextInputValue("availability").trim(),
    truck: interaction.fields.getTextInputValue("truck").trim() || "Not specified",
    about: interaction.fields.getTextInputValue("about").trim()
  };
  if (!/^(ats|ets2|both)$/i.test(answers.games)) {
    return interaction.editReply("Please enter ATS, ETS2, or Both in the game field, then submit again.");
  }

  const reviewChannel = interaction.guild.channels.cache.find(c => c.name === "applications-review" && c.isTextBased());
  if (!reviewChannel) return interaction.editReply("Management's private review channel is missing. Please contact a company manager.");

  const application = new EmbedBuilder().setColor(GOLD)
    .setTitle("📋 NEW DRIVER APPLICATION")
    .setDescription("A new private application is ready for management review.")
    .addFields(
      { name: "Applicant", value: interaction.user.tag + "\n<@" + interaction.user.id + ">" },
      { name: "Game", value: answers.games.toUpperCase(), inline: true },
      { name: "Preferred truck", value: answers.truck.slice(0, 1024), inline: true },
      { name: "Trucking experience", value: answers.experience.slice(0, 1024) },
      { name: "Availability", value: answers.availability.slice(0, 1024) },
      { name: "Why they want to join", value: answers.about.slice(0, 1024) }
    ).setFooter({ text: FOOTER }).setTimestamp();

  await reviewChannel.send({ embeds: [application] });

  const confirmation = new EmbedBuilder().setColor(GOLD)
    .setTitle("✅ BC Gold Logistics — Application Received")
    .setDescription("Thank you for applying! Your application has been delivered privately to company management. Please keep your Discord DMs open so we can contact you about the next steps.")
    .addFields(
      { name: "Game", value: answers.games.toUpperCase(), inline: true },
      { name: "Status", value: "Pending management review", inline: true }
    ).setFooter({ text: FOOTER }).setTimestamp();

  let dmSent = true;
  try { await interaction.user.send({ embeds: [confirmation] }); }
  catch (error) {
    dmSent = false;
    console.warn("Could not DM applicant " + interaction.user.id + ": " + (error.code || error.message));
  }

  await interaction.editReply(dmSent
    ? "Your application was submitted privately to management. I've also sent you a DM confirmation."
    : "Your application was submitted privately to management, but I couldn't DM you. Please enable server DMs so we can contact you.");
  return true;
}

module.exports = { data, execute, handleButton, handleModal };
