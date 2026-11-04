const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const MANAGERS = new Set([
  "Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer",
  "Executive Director","HR Director","HR Manager","Transportation Director","Transportation Manager",
  "Fleet Director","Dispatch Director","Dispatch Supervisor","Warehouse Director","Warehouse Manager",
  "Carrier Services Director","Safety & Compliance Director","Security Director","Security Supervisor",
  "Finance Director","IT & Facilities Director","IT Manager","Facilities Manager","Department Manager",
  "Shift Manager","Supervisor"
]);

const data = new SlashCommandBuilder()
  .setName("company-embed")
  .setDescription("Post a company information embed in the channel you choose.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(option => option.setName("channel").setDescription("Where this embed should be posted").setRequired(true)
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
  .addStringOption(option => option.setName("title").setDescription("Embed heading").setRequired(true).setMaxLength(256))
  .addStringOption(option => option.setName("description").setDescription("The information to display").setRequired(true).setMaxLength(4000));

async function execute(interaction) {
  const isManager = interaction.member?.roles?.cache?.some(role => MANAGERS.has(role.name));
  if (!interaction.guild || !isManager) {
    return interaction.reply({ content: "Only authorized BC Logistics LLC management can post company embeds.", ephemeral: true });
  }
  const channel = interaction.options.getChannel("channel", true);
  const title = interaction.options.getString("title", true);
  const description = interaction.options.getString("description", true);
  const embed = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: "BC Logistics LLC • Regional Transportation & Distribution" })
    .setTimestamp();
  await channel.send({ embeds: [embed] });
  return interaction.reply({ content: "Posted **" + title + "** in " + channel.toString() + ".", ephemeral: true });
}

module.exports = { data, execute };
