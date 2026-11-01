const {
  SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder,
  TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require("discord.js");

const APPLY_BUTTON_ID = "bcgold_apply_start";
const APPLY_MODAL_ID = "bcgold_apply_modal";

const data = new SlashCommandBuilder()
  .setName("apply")
  .setDescription("Open the BC Gold Logistics driver application.");

function buildApplicationModal() {
  const modal = new ModalBuilder().setCustomId(APPLY_MODAL_ID).setTitle("BC Gold Logistics Application");
  const fields = [
    new TextInputBuilder().setCustomId("games").setLabel("Which game? ATS, ETS2, or both").setStyle(TextInputStyle.Short).setMaxLength(40).setRequired(true),
    new TextInputBuilder().setCustomId("experience").setLabel("Your trucking / convoy experience").setStyle(TextInputStyle.Paragraph).setMaxLength(1000).setRequired(true),
    new TextInputBuilder().setCustomId("availability").setLabel("When are you usually available?").setStyle(TextInputStyle.Short).setMaxLength(150).setRequired(true),
    new TextInputBuilder().setCustomId("truck").setLabel("Preferred truck (or Not sure)").setStyle(TextInputStyle.Short).setMaxLength(100).setRequired(true),
    new TextInputBuilder().setCustomId("about").setLabel("Why would you like to join us?").setStyle(TextInputStyle.Paragraph).setMaxLength(1000).setRequired(true)
  ];
  modal.addComponents(...fields.map(field => new ActionRowBuilder().addComponents(field)));
  return modal;
}

async function execute(i) {
  await i.showModal(buildApplicationModal());
}

async function handleButton(i) {
  if (i.customId !== APPLY_BUTTON_ID) return false;
  await i.showModal(buildApplicationModal());
  return true;
}

async function handleModal(i) {
  if (i.customId !== APPLY_MODAL_ID) return false;
  await i.deferReply({ ephemeral: true });

  const reviewChannel = i.guild.channels.cache.find(channel =>
    channel.name === "applications-review" && channel.isTextBased()
  );
  if (!reviewChannel) {
    await i.editReply("The private applications-review channel was not found. Please contact company management.");
    return true;
  }

  const answers = {
    games: i.fields.getTextInputValue("games"),
    experience: i.fields.getTextInputValue("experience"),
    availability: i.fields.getTextInputValue("availability"),
    truck: i.fields.getTextInputValue("truck"),
    about: i.fields.getTextInputValue("about")
  };

  const applicationEmbed = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle("🚛 New BC Gold Logistics Driver Application")
    .setDescription("A driver application has been submitted for management review.")
    .addFields(
      { name: "Applicant", value: i.user.tag + " (ID: " + i.user.id + ")" },
      { name: "Game", value: answers.games, inline: true },
      { name: "Preferred truck", value: answers.truck, inline: true },
      { name: "Experience", value: answers.experience },
      { name: "Availability", value: answers.availability },
      { name: "Why they want to join", value: answers.about }
    )
    .setFooter({ text: "BC Gold Logistics • Recruitment" })
    .setTimestamp();

  await reviewChannel.send({ embeds: [applicationEmbed] });

  const confirmation = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle("✅ Your application has been received")
    .setDescription("Thank you for applying to BC Gold Logistics. Your application has been delivered privately to company management. We will contact you when it has been reviewed.")
    .addFields(
      { name: "Game", value: answers.games, inline: true },
      { name: "Preferred truck", value: answers.truck, inline: true }
    )
    .setFooter({ text: "Driven by Excellence. United by the Road." })
    .setTimestamp();

  let dmSent = true;
  try {
    await i.user.send({ embeds: [confirmation] });
  } catch (error) {
    dmSent = false;
    if (error.code !== 50007) throw error;
  }

  await i.editReply(dmSent
    ? "Your application was submitted privately to management. I also sent you a DM confirmation."
    : "Your application was submitted privately to management, but I couldn't DM you. Please enable DMs from server members to receive private updates."
  );
  return true;
}

function buildApplicationPanel() {
  const embed = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle("🚛 Join BC Gold Logistics")
    .setDescription("Ready to hit the road with us? We welcome ATS and ETS2 drivers who value teamwork, professionalism, and safe driving.")
    .addFields(
      { name: "How to apply", value: "Click **Start Your Application** below and complete the private application form." },
      { name: "What happens next?", value: "Your application is sent to company management in a private review channel. The bot will also DM you a confirmation." }
    )
    .setFooter({ text: "Driven by Excellence. United by the Road." });

  const button = new ButtonBuilder()
    .setCustomId(APPLY_BUTTON_ID)
    .setLabel("Start Your Application")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🚛");

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] };
}

module.exports = { data, execute, handleButton, handleModal, buildApplicationPanel, APPLY_BUTTON_ID };
