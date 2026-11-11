const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const CONFIRMATION = "DELETE-ALL-BC-GOLD-LOGISTICS";

const data = new SlashCommandBuilder()
  .setName("reset-company")
  .setDescription("Delete the existing server layout before a complete BC Gold Logistics rebuild.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName("confirmation")
      .setDescription("Enter the exact confirmation phrase shown in the command instructions.")
      .setRequired(true)
  );

async function execute(interaction) {
  if (!interaction.guild || interaction.user.id !== interaction.guild.ownerId) {
    return interaction.reply({
      content: "For safety, only the Discord server owner can run the full server reset.",
      ephemeral: true
    });
  }

  const supplied = interaction.options.getString("confirmation", true);
  if (supplied !== CONFIRMATION) {
    return interaction.reply({
      content: "Reset cancelled. The confirmation phrase did not match. Nothing was changed.",
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });
  const guild = interaction.guild;
  const botMember = await guild.members.fetchMe();

  if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels) ||
      !botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    return interaction.editReply(
      "Reset stopped before making changes. The bot needs Manage Channels and Manage Roles."
    );
  }

  let channelsDeleted = 0;
  let channelsSkipped = 0;
  let rolesDeleted = 0;
  let rolesSkipped = 0;
  const failures = [];

  await guild.channels.fetch();
  for (const channel of [...guild.channels.cache.values()]) {
    try {
      await channel.delete("BC Gold Logistics full Discord rebuild approved by server owner");
      channelsDeleted++;
    } catch (error) {
      channelsSkipped++;
      failures.push("Channel " + channel.name + ": " + (error.message || "delete failed"));
    }
  }

  await guild.roles.fetch();
  const protectedRoleIds = new Set([
    guild.id,
    ...botMember.roles.cache.map(role => role.id)
  ]);

  const customRoles = [...guild.roles.cache.values()]
    .filter(role => !protectedRoleIds.has(role.id) && !role.managed)
    .sort((a, b) => b.position - a.position);

  for (const role of customRoles) {
    try {
      await role.delete("BC Gold Logistics full Discord rebuild approved by server owner");
      rolesDeleted++;
    } catch (error) {
      rolesSkipped++;
      failures.push("Role " + role.name + ": " + (error.message || "delete failed"));
    }
  }

  const summary = [
    "BC Gold Logistics server reset finished.",
    "Channels deleted: " + channelsDeleted,
    "Channels skipped: " + channelsSkipped,
    "Custom roles deleted: " + rolesDeleted,
    "Roles preserved/skipped: " + rolesSkipped + " (includes @everyone, bot roles, and managed integration roles).",
    "The Discord server itself and its members were not deleted.",
    "Next: run /setup-company to create the fresh VTC layout."
  ];

  if (failures.length) {
    summary.push("Some items could not be deleted because of Discord permissions or role hierarchy. Check the bot logs and permissions.");
    console.error("BC Gold Logistics reset had deletion failures:", failures);
  }

  await interaction.editReply(summary.join("\n"));
}

module.exports = { data, execute };
