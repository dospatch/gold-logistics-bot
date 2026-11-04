const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

const MANAGEMENT_ROLES = new Set([
  "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
  "Chief Financial Officer", "Executive Director", "Transportation Director",
  "Dispatch Director", "Department Manager", "Supervisor"
]);

const data = new SlashCommandBuilder()
  .setName("convoy-cancel")
  .setDescription("Remove a BC Gold Logistics convoy announcement by ID or from a channel.")
  .addStringOption(option =>
    option.setName("message_id")
      .setDescription("Optional: exact message ID to remove")
      .setRequired(false)
  )
  .addChannelOption(option =>
    option.setName("channel")
      .setDescription("Optional: channel to search; defaults to company-session-announcements")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
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

    const messageId = interaction.options.getString("message_id")?.trim();
    const selectedChannel = interaction.options.getChannel("channel");
    const channel = selectedChannel || interaction.guild.channels.cache.find(
      item => item.name === "company-session-announcements" && item.type === ChannelType.GuildText
    );

    if (!channel || !channel.isTextBased() || !channel.messages) {
      return interaction.editReply({ content: "I couldn't find a usable text channel. Select a text channel or check that #company-session-announcements exists." });
    }

    let message = null;

    if (messageId) {
      if (!/^\d{17,20}$/.test(messageId)) {
        return interaction.editReply({ content: "That message ID does not look valid. Copy the ID of the convoy announcement and try again." });
      }
      message = await channel.messages.fetch(messageId).catch(() => null);
      if (!message) {
        return interaction.editReply({ content: "I couldn't find that message in the selected channel. Check the message ID or channel." });
      }
    } else {
      const recentMessages = await channel.messages.fetch({ limit: 100 });
      message = recentMessages.find(item =>
        item.author.id === interaction.client.user.id &&
        item.embeds.some(embed => embed.title === "BC Gold Logistics Convoy")
      ) || null;

      if (!message) {
        return interaction.editReply({ content: `I couldn't find a BC Gold Logistics convoy announcement in #${channel.name} among the latest 100 messages.` });
      }
    }

    if (message.author.id !== interaction.client.user.id) {
      return interaction.editReply({ content: "For safety, I can only remove convoy announcements posted by this bot." });
    }

    const isConvoy = message.embeds.some(embed => embed.title === "BC Gold Logistics Convoy");
    if (!isConvoy) {
      return interaction.editReply({ content: "That message is not recognized as a BC Gold Logistics convoy announcement." });
    }

    await message.delete();
    return interaction.editReply({ content: `The convoy announcement was removed from #${channel.name}.` });
  } catch (error) {
    console.error("Convoy cancellation failed:", error);
    return interaction.editReply({ content: "I couldn't remove that convoy. Check the bot's Manage Messages permission and the Render logs." }).catch(console.error);
  }
}

module.exports = { data, execute };
