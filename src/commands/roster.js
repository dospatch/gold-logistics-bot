const { SlashCommandBuilder } = require("discord.js");
const { createEmbed } = require("../lib/embeds");

const data = new SlashCommandBuilder()
  .setName("roster")
  .setDescription("View the company driver and management roster.");

async function execute(interaction) {
  // Acknowledge Discord immediately so member fetching cannot exceed the 3-second deadline.
  await interaction.deferReply({ ephemeral: true });

  try {
    await interaction.guild.members.fetch();

    const names = [
      "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
      "Chief Financial Officer", "Executive Director", "Transportation Director",
      "Dispatch Director", "Department Manager", "Supervisor", "Senior Driver",
      "Driver Trainer", "Company Driver", "Probationary Driver"
    ];

    const lines = names.map(name => {
      const role = interaction.guild.roles.cache.find(item => item.name === name);
      if (!role) return null;
      const members = role.members.map(member => member.user.tag);
      return "**" + name + ":** " + (members.join(", ") || "No members assigned");
    }).filter(Boolean);

    await interaction.editReply({
      embeds: [createEmbed({
        title: "BC Gold Logistics Company Roster",
        description: lines.join("\n") || "No company roles were found. Contact management.",
        timestamp: true
      })]
    });
  } catch (error) {
    console.error("Roster command failed:", error);
    const detail = error.code === 50001 || error.code === 50013
      ? "The bot is missing permission to view server members or roles."
      : error.code === 4014
        ? "The Server Members Intent is not enabled in the Discord Developer Portal."
        : "The roster could not be loaded. Check the Render logs for the detailed error.";
    await interaction.editReply({ content: detail, embeds: [] }).catch(console.error);
  }
}

module.exports = { data, execute };
