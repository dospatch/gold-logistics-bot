const {
  SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder,
  TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require("discord.js");

const APPLY_BUTTON_ID = "bcgold_apply_start";
const APPLY_MODAL_ID = "bcgold_apply_modal";
const REVIEW_PREFIX = "bcgold_review";
const MANAGER_ROLES = ["Owner", "Chief Executive Officer", "Operations Manager", "Fleet Manager"];

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
  if (i.customId === APPLY_BUTTON_ID) {
    await i.showModal(buildApplicationModal());
    return true;
  }

  if (!i.customId.startsWith(REVIEW_PREFIX + ":")) return false;
  if (!i.inGuild() || !i.memberPermissions?.has("Administrator")) {
    const hasManagerRole = i.member?.roles?.cache?.some(role => MANAGER_ROLES.includes(role.name));
    if (!hasManagerRole) {
      await i.reply({ content: "Only company management can review applications.", ephemeral: true });
      return true;
    }
  }

  const [, action, applicantId] = i.customId.split(":");
  if (!["approve", "deny"].includes(action) || !/^\d{17,20}$/.test(applicantId)) {
    await i.reply({ content: "This application review button is invalid.", ephemeral: true });
    return true;
  }

  const original = i.message.embeds[0];
  if (!original) {
    await i.reply({ content: "The application details could not be found.", ephemeral: true });
    return true;
  }
  const statusField = original.fields?.find(field => field.name === "Status");
  if (statusField && statusField.value !== "Pending") {
    await i.reply({ content: "This application has already been reviewed.", ephemeral: true });
    return true;
  }

  await i.deferUpdate();
  const approved = action === "approve";
  const status = approved ? "Approved" : "Denied";
  const color = approved ? 0x2ECC71 : 0xE74C3C;
  const updatedEmbed = EmbedBuilder.from(original)
    .setColor(color)
    .setFields(
      ...(original.fields || []).filter(field => field.name !== "Status" && field.name !== "Decision"),
      { name: "Status", value: status, inline: true },
      { name: "Decision", value: "Reviewed by " + i.user.tag, inline: true }
    );

  await i.message.edit({ embeds: [updatedEmbed], components: [] });

  let dmDelivered = true;
  try {
    const applicant = await i.client.users.fetch(applicantId);
    const dmEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(approved ? "🎉 Your BC Gold Logistics application was approved!" : "BC Gold Logistics Application Update")
      .setDescription(approved
        ? "Congratulations! Company management has approved your driver application. Welcome to BC Gold Logistics! Please check the server for your next steps."
        : "Thank you for your interest in BC Gold Logistics. After reviewing your application, company management has decided not to move forward at this time. We appreciate the time you took to apply.")
      .addFields({ name: "Application status", value: status })
      .setFooter({ text: "Driven by Excellence. United by the Road." })
      .setTimestamp();
    await applicant.send({ embeds: [dmEmbed] });
  } catch (error) {
    dmDelivered = false;
    console.error("Could not DM applicant " + applicantId + ":", error);
  }

  await i.followUp({
    content: status + " application for <@" + applicantId + ">." + (dmDelivered ? " The applicant was notified by DM." : " I could not deliver the DM; the applicant may have DMs disabled."),
    ephemeral: true
  });
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
      { name: "Why they want to join", value: answers.about },
      { name: "Status", value: "Pending", inline: true }
    )
    .setFooter({ text: "BC Gold Logistics • Recruitment" })
    .setTimestamp();

  const reviewButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(REVIEW_PREFIX + ":approve:" + i.user.id).setLabel("Approve").setStyle(ButtonStyle.Success).setEmoji("✅"),
    new ButtonBuilder().setCustomId(REVIEW_PREFIX + ":deny:" + i.user.id).setLabel("Deny").setStyle(ButtonStyle.Danger).setEmoji("❌")
  );
  await reviewChannel.send({ embeds: [applicationEmbed], components: [reviewButtons] });

  const confirmation = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle("✅ Your application has been received")
    .setDescription("Thank you for applying to BC Gold Logistics. Your application is now pending staff review. We will send you a private Discord DM when management makes a decision.")
    .addFields(
      { name: "Game", value: answers.games, inline: true },
      { name: "Preferred truck", value: answers.truck, inline: true },
      { name: "Status", value: "Pending", inline: true }
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
    ? "Your application was submitted privately to management. I sent you a DM confirming that its status is Pending."
    : "Your application was submitted privately to management, but I couldn't DM you. Please enable DMs from server members to receive your status updates."
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
      { name: "What happens next?", value: "Your application is sent to company management in a private review channel. The bot will DM you when management approves or denies it." }
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
