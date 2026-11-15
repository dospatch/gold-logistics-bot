const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require("discord.js");

const MARKER = "BCGL_COMPANY_SETTINGS_V1";
const MANAGERS = new Set([
  "Owner","President","Chief Executive Officer","Chief Operating Officer",
  "Executive Director","HR Director","Transportation Director","Fleet Director",
  "Dispatch Director","Safety & Training Director","Department Manager","Shift Manager","Supervisor"
]);
const CHANNEL_TYPES = [
  ["welcome", "Welcome messages"],
  ["rules", "Company rules"],
  ["handbook", "Employee handbook"],
  ["announcements", "Company announcements"],
  ["careers", "Careers and applications"],
  ["freight", "Wholesale freight information"],
  ["carriers", "Outside carrier registration"],
  ["support", "Customer support"],
  ["load-board", "Wholesale load board"],
  ["dispatch-log", "Dispatch reports"],
  ["active-shipments", "Active shipments"],
  ["employee-support", "Employee support"],
  ["applications-review", "Private application reviews"],
  ["carrier-appointments", "Carrier appointments"]
];
const DEFAULT_CHANNELS = {
  welcome: "welcome", rules: "company-rules", handbook: "driver-handbook",
  announcements: "announcements", careers: "employment-applications",
  freight: "wholesale-load-board", carriers: "carrier-registration", support: "carrier-support",
  "load-board": "wholesale-load-board", "dispatch-log": "dispatch-reports",
  "active-shipments": "active-shipments", "employee-support": "employee-support",
  "applications-review": "applications-review", "carrier-appointments": "carrier-appointments"
};

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
  .setDescription("Customize BC Gold Logistics VTC welcome, role, and information destinations.")
  .setDefaultMemberPermissions(null)
  .addSubcommand(sub => sub.setName("set-channel").setDescription("Choose where a company panel or message belongs.")
    .addStringOption(option => option.setName("type").setDescription("Which destination are you setting?").setRequired(true)
      .addChoices(...CHANNEL_TYPES.map(([value,name]) => ({ name, value }))))
    .addChannelOption(option => option.setName("channel").setDescription("The channel to use").setRequired(true)
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)))
  .addSubcommand(sub => sub.setName("set-welcome-message").setDescription("Customize the automatic welcome message.")
    .addStringOption(option => option.setName("message").setDescription("Use {user} for the member and {server} for the server name.").setRequired(true).setMaxLength(1500)))
  .addSubcommand(sub => sub.setName("set-auto-roles").setDescription("Choose up to five roles new members receive automatically.")
    .addRoleOption(option => option.setName("role-1").setDescription("First starter role").setRequired(true))
    .addRoleOption(option => option.setName("role-2").setDescription("Second starter role").setRequired(false))
    .addRoleOption(option => option.setName("role-3").setDescription("Third starter role").setRequired(false))
    .addRoleOption(option => option.setName("role-4").setDescription("Fourth starter role").setRequired(false))
    .addRoleOption(option => option.setName("role-5").setDescription("Fifth starter role").setRequired(false)))
  .addSubcommand(sub => sub.setName("set-auto-role").setDescription("Set one automatic role (legacy single-role option).")
    .addRoleOption(option => option.setName("role").setDescription("Starter role for new members").setRequired(true)))
  .addSubcommand(sub => sub.setName("clear-auto-role").setDescription("Stop automatically assigning a role to new members."))
  .addSubcommand(sub => sub.setName("configure-defaults").setDescription("Map company features to the existing server channels without changing channels or permissions."))
  .addSubcommand(sub => sub.setName("show").setDescription("View the current company automation destinations."))
  .addSubcommand(sub => sub.setName("audit").setDescription("Create a read-only report of current roles, categories, channels, and access overrides."));

async function execute(interaction) {
  if (!interaction.guild || !isManager(interaction.member)) {
    return interaction.reply({ content: "Only authorized BC Gold Logistics management can change company settings.", ephemeral: true });
  }
  if (interaction.options.getSubcommand() === "audit") {
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    await Promise.all([guild.roles.fetch(), guild.channels.fetch()]);
    const roleLines = guild.roles.cache.sort((a,b) => b.position-a.position).map(role => `${role.name} | ID ${role.id} | position ${role.position} | managed ${role.managed}`);
    const categories = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).sort((a,b) => a.position-b.position);
    const channelLines = [];
    for (const category of categories.values()) {
      const categoryOverwrites = category.permissionOverwrites.cache.map(overwrite => {
        const target = overwrite.type === 0 ? guild.roles.cache.get(overwrite.id)?.name || `Role ${overwrite.id}` : guild.members.cache.get(overwrite.id)?.user?.tag || `Member ${overwrite.id}`;
        return `${target}: allow=${overwrite.allow.toArray().join(",") || "none"}; deny=${overwrite.deny.toArray().join(",") || "none"}`;
      });
      channelLines.push(`\n[${category.name}] | ID ${category.id} | overrides: ${categoryOverwrites.join(" || ") || "none"}`);
      const children = guild.channels.cache.filter(channel => channel.parentId === category.id).sort((a,b) => a.position-b.position);
      for (const channel of children.values()) {
        const overwrites = channel.permissionOverwrites.cache.map(overwrite => {
          const target = overwrite.type === 0 ? guild.roles.cache.get(overwrite.id)?.name || `Role ${overwrite.id}` : guild.members.cache.get(overwrite.id)?.user?.tag || `Member ${overwrite.id}`;
          return `${target}: allow=${overwrite.allow.toArray().join(",") || "none"}; deny=${overwrite.deny.toArray().join(",") || "none"}`;
        });
        channelLines.push(`  #${channel.name} | ${channel.type} | ID ${channel.id} | synced ${channel.permissionsLocked === true} | overrides: ${overwrites.join(" || ") || "none"}`);
      }
    }
    const uncategorized = guild.channels.cache.filter(channel => !channel.parentId && channel.type !== ChannelType.GuildCategory);
    if (uncategorized.size) {
      channelLines.push("\n[UNCATEGORIZED]");
      for (const channel of uncategorized.values()) channelLines.push(`  ${channel.name} | ${channel.type} | ID ${channel.id}`);
    }
    const report = [
      "BC GOLD LOGISTICS — READ-ONLY SERVER AUDIT",
      `Guild: ${guild.name} (${guild.id})`,
      `Generated: ${new Date().toISOString()}`,
      `Roles: ${guild.roles.cache.size} | Categories: ${categories.size} | Channels: ${guild.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory).size}`,
      "\nROLES", ...roleLines, "\nCHANNELS AND PERMISSION OVERRIDES", ...channelLines
    ].join("\n");
    const file = new AttachmentBuilder(Buffer.from(report, "utf8"), { name: "bc-logistics-server-audit.txt" });
    return interaction.editReply({ content: "Read-only audit generated. No roles, channels, permissions, or messages were changed.", files: [file] });
  }
  const { channel: storage, settings } = await readSettings(interaction.guild);
  if (!storage) {
    return interaction.reply({ content: "I couldn't access the private #management-discussions channel. Please make sure it exists and that the bot can view and send messages there.", ephemeral: true });
  }
  const action = interaction.options.getSubcommand();
  if (action === "configure-defaults") {
    const mapped = [];
    const missing = [];
    settings.channels = { ...(settings.channels || {}) };
    for (const [key, channelName] of Object.entries(DEFAULT_CHANNELS)) {
      const channel = interaction.guild.channels.cache.find(item => item.name === channelName && item.type === ChannelType.GuildText);
      if (!channel) { missing.push("#" + channelName); continue; }
      if (!settings.channels[key]) settings.channels[key] = channel.id;
      mapped.push("**" + key + ":** <#" + settings.channels[key] + ">");
    }
    await saveSettings(interaction.guild, storage, settings);
    return interaction.reply({ content: "Existing channel destinations have been mapped. Existing custom choices were preserved.\n" + mapped.join("\n") + (missing.length ? "\n\nNot found: " + missing.join(", ") : ""), ephemeral: true });
  }
  if (action === "show") {
    const lines = CHANNEL_TYPES.map(([key,label]) => {
      const id = settings.channels?.[key];
      return "**" + label + ":** " + (id ? "<#" + id + ">" : "Not configured");
    });
    const autoRoleIds = Array.isArray(settings.autoRoleIds) ? settings.autoRoleIds : (settings.autoRoleId ? [settings.autoRoleId] : []);
    lines.push("**Automatic roles:** " + (autoRoleIds.length ? autoRoleIds.map(id => "<@&" + id + ">").join(", ") : "Off"));
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
  if (action === "set-auto-roles" || action === "set-auto-role") {
    const roles = action === "set-auto-role"
      ? [interaction.options.getRole("role", true)]
      : ["role-1", "role-2", "role-3", "role-4", "role-5"].map(name => interaction.options.getRole(name)).filter(Boolean);
    const uniqueRoles = [...new Map(roles.map(role => [role.id, role])).values()];
    const botHighest = interaction.guild.members.me.roles.highest.position;
    const invalid = uniqueRoles.find(role => role.managed || role.position >= botHighest);
    if (invalid) {
      return interaction.reply({ content: "I can't assign " + invalid.toString() + " because it is managed or is at/above my bot role. Move the bot role above it, then try again.", ephemeral: true });
    }
    settings.autoRoleIds = uniqueRoles.map(role => role.id);
    delete settings.autoRoleId;
    await saveSettings(interaction.guild, storage, settings);
    return interaction.reply({ content: "New members will automatically receive: " + uniqueRoles.map(role => role.toString()).join(", ") + ".", ephemeral: true });
  }
  if (action === "clear-auto-role") {
    delete settings.autoRoleId;
    delete settings.autoRoleIds;
    await saveSettings(interaction.guild, storage, settings);
    return interaction.reply({ content: "Automatic role assignment has been turned off.", ephemeral: true });
  }
}

async function handleMemberJoin(member) {
  try {
    const { settings } = await readSettings(member.guild);
    const autoRoleIds = Array.isArray(settings.autoRoleIds) ? settings.autoRoleIds : (settings.autoRoleId ? [settings.autoRoleId] : []);
    if (autoRoleIds.length) {
      const botHighest = member.guild.members.me.roles.highest.position;
      const assignableRoles = [];
      for (const roleId of autoRoleIds) {
        const role = await member.guild.roles.fetch(roleId).catch(() => null);
        if (role && !role.managed && role.position < botHighest) assignableRoles.push(role);
        else console.warn("BC Logistics automatic role skipped (missing, managed, or above bot): " + roleId);
      }
      if (assignableRoles.length) {
        await member.roles.add(assignableRoles, "BC Gold Logistics automatic new-member roles");
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
