const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const MARKER = "BCGL_COMPANY_SETTINGS_V1";
const MANAGERS = new Set([
  "Owner","President","Chief Executive Officer","Chief Operating Officer","Chief Financial Officer",
  "Executive Director","HR Director","HR Manager","Transportation Director","Transportation Manager",
  "Fleet Director","Dispatch Director","Dispatch Supervisor","Warehouse Director","Warehouse Manager",
  "Carrier Services Director","Safety & Compliance Director","Security Director","Security Supervisor",
  "Finance Director","IT & Facilities Director","IT Manager","Facilities Manager","Department Manager",
  "Shift Manager","Supervisor"
]);
const CHANNEL_TYPES = [
  ["welcome", "Welcome messages"],
  ["rules", "Company rules"],
  ["handbook", "Employee handbook"],
  ["announcements", "Company announcements"],
  ["careers", "Careers and applications"],
  ["freight", "Wholesale freight information"],
  ["carriers", "Outside carrier registration"],
  ["support", "Customer support"]
];

function isManager(member) {
  return member?.roles?.cache?.some(role => MANAGERS.has(role.name));
}
async function settingsChannel(guild) {
  await guild.channels.fetch();
  return guild.channels.cache.find(channel =>
    channel.name === "management-discussions" &&
    channel.type === ChannelType.GuildText &&
    channel.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.ViewChannel) &&
    channel.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages)
  );
}
async function readSettings(guild) {
  const channel = await settingsChannel(guild);
  if (!channel) return { channel: null, settings: {} };
  const messages = await channel.messages.fetch({ limit: 100 });
  const record = messages.find(message =>
    message.author.id === guild.client.user.id && message.content.startsWith(MARKER)
  );
  if (!record) return { channel, settings: {} };
  try {
    const json = record.content.slice(MARKER.length).trim();
    return { channel, settings: JSON.parse(json) };
  } catch {
    console.error("BC Logistics settings record could not be parsed.");
    return { channel, settings: {} };
  }
}
async function saveSettings(guild, channel, settings) {
  if (!channel) throw new Error("The private #management-discussions channel is required to store settings safely.");
  const content = MARKER + "\n" + JSON.stringify(settings);
  const messages = await channel.messages.fetch({ limit: 100 });
  const record = messages.find(message =>
    message.author.id === guild.client.user.id && message.content.startsWith(MARKER)
  );
  if (record) await record.edit({ content });
  else await channel.send({ content });
}
const data = new SlashCommandBuilder()
  .setName("company-settings")
  .setDescription("Customize BC Logistics LLC welcome, role, and information destinations.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(sub => sub.setName("set-channel").setDescription("Choose where a company panel or message belongs.")
    .addStringOption(option => option.setName("type").setDescription("Which destination are you setting?").setRequired(true)
      .addChoices(...CHANNEL_TYPES.map(([value,name]) => ({ name, value }))))
    .addChannelOption(option => option.setName("channel").setDescription("The channel to use").setRequired(true)
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)))
  .addSubcommand(sub => sub.setName("set-welcome-message").setDescription("Customize the automatic welcome message.")
    .addStringOption(option => option.setName("message").setDescription("Use {user} for the member and {server} for the server name.").setRequired(true).setMaxLength(1500)))
  .addSubcommand(sub => sub.setName("set-auto-role").setDescription("Choose the role new members receive automatically.")
    .addRoleOption(option => option.setName("role").setDescription("Starter role for new members").setRequired(true)))
  .addSubcommand(sub => sub.setName("clear-auto-role").setDescription("Stop automatically assigning a role to new members."))
  .addSubcommand(sub => sub.setName("show").setDescription("View the current company automation destinations."));

async function execute(interaction) {
  if (!interaction.guild || !isManager(interaction.member)) {
    return interaction.reply({ content: "Only authorized BC Logistics LLC management can change company settings.", ephemeral: true });
  }
  const { channel: storage, settings } = await readSettings(interaction.guild);
  if (!storage) {
    return interaction.reply({ content: "I couldn't access the private #management-discussions channel. Please make sure it exists and that the bot can view and send messages there.", ephemeral: true });
  }
  const action = interaction.options.getSubcommand();
  if (action === "show") {
    const lines = CHANNEL_TYPES.map(([key,label]) => {
      const id = settings.channels?.[key];
      return "**" + label + ":** " + (id ? "<#" + id + ">" : "Not configured");
    });
    lines.push("**Automatic role:** " + (settings.autoRoleId ? "<@&" + settings.autoRoleId + ">" : "Off"));
    lines.push("**Welcome message:** " + (settings.welcomeMessage || "Default welcome message"));
    return interaction.reply({ content: lines.join("\n"), ephemeral: true });
  }
  if (action === "set-channel") {
    const type = interaction.options.getString("type", true);
    const channel = interaction.options.getChannel("channel", true);
    settings.channels = { ...(settings.channels || {}), [type]: channel.id };
    await saveSettings(interaction.guild, storage, settings);
    return interaction.reply({ content: "Saved. **" + CHANNEL_TYPES.find(([key]) => key === type)[1] + "** will now use " + channel.toString() + ".", ephemeral: true });
  }
  if (action === "set-welcome-message") {
    settings.welcomeMessage = interaction.options.getString("message", true);
    await saveSettings(interaction.guild, storage, settings);
    return interaction.reply({ content: "Your automatic welcome message has been saved. Use {user} and {server} as placeholders.", ephemeral: true });
  }
  if (action === "set-auto-role") {
    const role = interaction.options.getRole("role", true);
    if (role.managed || role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: "I can't assign that role because it is managed or is above my bot role. Move the bot role above the selected role, then try again.", ephemeral: true });
    }
    settings.autoRoleId = role.id;
    await saveSettings(interaction.guild, storage, settings);
    return interaction.reply({ content: "New members will now receive " + role.toString() + " automatically when they join.", ephemeral: true });
  }
  if (action === "clear-auto-role") {
    delete settings.autoRoleId;
    await saveSettings(interaction.guild, storage, settings);
    return interaction.reply({ content: "Automatic role assignment has been turned off.", ephemeral: true });
  }
}

async function handleMemberJoin(member) {
  try {
    const { settings } = await readSettings(member.guild);
    if (settings.autoRoleId) {
      const role = await member.guild.roles.fetch(settings.autoRoleId);
      if (role && !role.managed && role.position < member.guild.members.me.roles.highest.position) {
        await member.roles.add(role, "BC Logistics LLC automatic new-member role");
      }
    }
    const channelId = settings.channels?.welcome;
    if (!channelId) return;
    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased()) return;
    const template = settings.welcomeMessage || "Welcome {user} to **{server}**! Please review the company rules and start in the welcome channel.";
    const content = template.replaceAll("{user}", member.toString()).replaceAll("{server}", member.guild.name);
    await channel.send({ content, allowedMentions: { users: [member.id] } });
  } catch (error) {
    console.error("BC Logistics new-member automation failed:", error);
  }
}

module.exports = { data, execute, handleMemberJoin };
