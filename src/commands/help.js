const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Show the BC Gold Logistics command guide.");

async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle("BC Gold Logistics | Command Guide")
    .setDescription("Use these commands in the BC Gold Logistics Discord server.")
    .addFields(
      { name: "Company", value: "`/setup-company` — create or organize the company Discord layout\n`/company-settings` — manage company settings\n`/company-embed` — publish an approved company information embed\n`/roster` — view company role membership" },
      { name: "Drivers", value: "`/apply` — view driver recruitment information\n`/delivery` — submit a completed delivery report" },
      { name: "Dispatch & freight", value: "`/convoy` — announce a company convoy\n`/convoy-cancel` — remove a bot-posted convoy announcement\n`/load` — create, assign, or update wholesale freight loads" },
      { name: "Outside carriers", value: "`/carrier-register` — submit a partner registration\n`/carrier-review` — review a carrier registration" },
      { name: "Application reviews", value: "`/approve` and `/deny` — review a driver application" }
    )
    .setFooter({ text: "Commands are limited by company role and Discord permissions." });
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { data, execute };
