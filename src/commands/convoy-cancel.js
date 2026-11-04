const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const MANAGEMENT_ROLES = new Set([
  "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
  "Chief Financial Officer", "Executive Director", "Transportation Director",
  "Dispatch Director", "Department Manager", "Supervisor"
]);

const data = new SlashCommandBuilder()
  .setName("convoy-cancel")
  .setDescription("Remove an accidentally posted BC Gold Logistics convoy announcement.")
  .addStringOption(option =>
    option.setName("message_id")
      .setDescription("Message ID of the convoy announcement to remove")
      .setRequired(true)
  );

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const isManager =
      interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ||
      interaction.member?.roles?.cache?.some(role => MANAGEMENT_ROLES.has(role.name));

    if (!isManager) {
      return interaction.editReply({ content: "Management only. You are not authorized to cancel convoy announcements." });
    }

    const messageId = interaction.options.getString("message_id", true).trim();
    if (!/^\\d{17,20}$/.test(messageId)) {
      return interaction.editReply({ content: "That message ID does not look valid. Copy the ID of the convoy announcement and try again." });
    }

    const channel = interaction.guild.channels.cache.find(
      item => item.name === "company-session-announcements" && item.isTextBased() && item.messages
    );

    if (!channel) {
      return interaction.editReply({ content: "The #company-session-announcements channel could not be found." });
    }

    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) {
      return interaction.editReply({ content: "I couldn't find that message in #company-session-announcements. Check the message ID." });
    }

    if (message.author.id !== interaction.client.user.id) {
      return interaction.editReply({ content: "For safety, I can only remove convoy announcements posted by this bot." });
    }

    const isConvoy = message.embeds.some(embed => embed.title === "BC Gold Logistics Convoy");
    if (!isConvoy) {
      return interaction.editReply({ content: "That bot message is not recognized as a BC Gold Logistics convoy announcement." });
    }

    await message.delete();
    return interaction.editReply({ content: "The convoy announcement was removed from #company-session-announcements." });
  } catch (error) {
    console.error("Convoy cancellation failed:", error);
    return interaction.editReply({ content: "I couldn't remove that convoy. Check the bot's Manage Messages permission and the Render logs." }).catch(console.error);
  }
}

module.exports = { data, execute };
