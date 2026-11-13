const { ChannelType, PermissionFlagsBits } = require("discord.js");

const ROLE_NAMES = {
  staff: "BC • Staff",
  management: "BC • Management"
};

const STAFF_ONLY = new Set([
  "🔒│staff-chat",
  "📋│staff-logs",
  "🚨│alerts",
  "🛠️│development"
]);

const MANAGEMENT_ONLY = new Set(["🗃️│admin"]);

const READ_ONLY = new Set([
  "📜│community-guidelines",
  "📢│announcements",
  "📌│server-info",
  "📊│bot-status"
]);

async function ensureRoles(guild) {
  const roles = {};
  for (const [key, name] of Object.entries(ROLE_NAMES)) {
    let role = guild.roles.cache.find(r => r.name === name);
    if (!role) {
      role = await guild.roles.create({ name, reason: "BC TRUCK WORKS permission organization" });
    }
    roles[key] = role;
  }
  return roles;
}

function overwrites(guild, roles, channelName, categoryName) {
  if (MANAGEMENT_ONLY.has(channelName)) {
    return [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: roles.management.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
    ];
  }

  if (STAFF_ONLY.has(channelName) || categoryName === "🔒 STAFF • TRUCK WORKS") {
    return [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: roles.staff.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: roles.management.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
    ];
  }

  if (READ_ONLY.has(channelName)) {
    return [
      { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] }
    ];
  }

  return [];
}

async function organize(guild, layout) {
  const roles = await ensureRoles(guild);

  for (let i = 0; i < layout.length; i++) {
    const [categoryName, channelNames] = layout[i];
    const category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === categoryName);
    if (!category) continue;

    await category.setPosition(i);
    await category.permissionOverwrites.set(
      categoryName === "🔒 STAFF • TRUCK WORKS"
        ? overwrites(guild, roles, "", categoryName)
        : []
    );

    for (let j = 0; j < channelNames.length; j++) {
      const name = channelNames[j];
      const voice = ["🚛│Truckers","◎│Convoy 1","◎│Convoy 2","🎙️│Driver Lounge","🔊│Dispatch"].includes(name);
      const channel = guild.channels.cache.find(
        c => c.name === name && c.type === (voice ? ChannelType.GuildVoice : ChannelType.GuildText)
      );
      if (!channel) continue;

      await channel.setPosition(j);
      await channel.permissionOverwrites.set(overwrites(guild, roles, name, categoryName));
    }
  }

  return roles;
}

module.exports = { organize };