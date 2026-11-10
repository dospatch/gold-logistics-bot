const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

// VTC roles only. Existing roles are never deleted or renamed.
const roles = [
  ["Owner", 0xD4AF37],
  ["President", 0xF1C40F],
  ["Chief Executive Officer", 0xE5B83B],
  ["Chief Operating Officer", 0xE67E22],
  ["Executive Director", 0xC49A35],
  ["HR Director", 0x9B59B6],
  ["Transportation Director", 0x2980B9],
  ["Fleet Director", 0x3498DB],
  ["Dispatch Director", 0x1F8A70],
  ["Department Manager", 0xB8860B],
  ["Shift Manager", 0xA67C52],
  ["Supervisor", 0xA67C52],
  ["Dispatcher", 0x1F8A70],
  ["Company Driver", 0x1ABC9C],
  ["Senior Driver", 0x2ECC71],
  ["Probationary Driver", 0x95A5A6],
  ["Driver Trainer", 0x27AE60],
  ["Convoy Coordinator", 0xD4AF37],
  ["Safety Officer", 0xC0392B],
  ["Recruiter", 0x9B59B6],
  ["Applicant", 0x7F8C8D],
  ["Employee", 0x2ECC71],
  ["LOA", 0x5865F2],
  ["Guest", 0x777777]
];

const layout = {
  "🏢 COMPANY HEADQUARTERS": [
    "welcome", "company-announcements", "company-information",
    "company-handbook", "company-rules", "company-updates"
  ],
  "🧑‍💼 RECRUITMENT & HR": [
    "employment-applications", "employee-support", "onboarding",
    "training", "loa-requests", "promotions"
  ],
  "🚛 DRIVER OPERATIONS": [
    "driver-check-in", "driver-chat", "company-fleet",
    "vehicle-assignments", "fleet-inspections", "maintenance-reports",
    "delivery-logs"
  ],
  "📋 DISPATCH & FREIGHT": [
    "wholesale-load-board", "load-assignments", "active-shipments",
    "delivery-confirmations", "dispatch-reports"
  ],
  "🗓️ CONVOY OPERATIONS": [
    "company-session-announcements", "company-session-schedule",
    "route-briefings", "convoy-media"
  ],
  "💬 COMPANY COMMUNITY": [
    "general-chat", "company-media", "suggestions", "truck-showcase"
  ],
  "🔒 MANAGEMENT": [
    "executive-office", "management-discussions", "department-reports",
    "company-strategy"
  ],
  "🔒 HR PRIVATE": [
    "applications-review", "employee-records", "hr-staff-chat"
  ],
  "🔒 DISPATCH STAFF": [
    "dispatch-staff-chat", "dispatch-logs"
  ],
  "🔊 COMPANY VOICE": [
    "company-operations", "dispatch-voice", "management-meetings", "afk"
  ]
};

const access = {
  "🚛 DRIVER OPERATIONS": [
    "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
    "Transportation Director", "Fleet Director", "Company Driver", "Senior Driver",
    "Probationary Driver", "Driver Trainer", "Safety Officer", "Department Manager",
    "Shift Manager", "Supervisor"
  ],
  "📋 DISPATCH & FREIGHT": [
    "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
    "Transportation Director", "Dispatch Director", "Dispatcher", "Company Driver",
    "Senior Driver", "Probationary Driver", "Driver Trainer", "Department Manager",
    "Shift Manager", "Supervisor"
  ],
  "🔒 MANAGEMENT": [
    "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
    "Executive Director", "HR Director", "Transportation Director", "Fleet Director",
    "Dispatch Director", "Department Manager"
  ],
  "🔒 HR PRIVATE": [
    "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
    "HR Director", "Recruiter"
  ],
  "🔒 DISPATCH STAFF": [
    "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
    "Transportation Director", "Dispatch Director", "Dispatcher", "Department Manager",
    "Shift Manager", "Supervisor"
  ]
};

const data = new SlashCommandBuilder()
  .setName("setup-company")
  .setDescription("Create BC Gold Logistics VTC roles and channels without deleting existing server content.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const guild = interaction.guild;
  const botMember = await guild.members.fetchMe();

  if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels) ||
      !botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    return interaction.editReply("I need Manage Channels and Manage Roles. Move my bot role above the company roles, then retry.");
  }

  let rolesCreated = 0;
  let categoriesCreated = 0;
  let channelsCreated = 0;
  let existingChannelsLeftInPlace = 0;

  for (const [name, color] of roles) {
    const existing = guild.roles.cache.find(role => role.name === name);
    if (!existing) {
      await guild.roles.create({ name, color, reason: "BC Gold Logistics VTC setup" });
      rolesCreated++;
    }
  }

  await guild.roles.fetch();
  await guild.channels.fetch();

  const botPermissions = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles
  ];

  for (const [categoryName, channelNames] of Object.entries(layout)) {
    const allowedNames = access[categoryName];
    const restricted = Array.isArray(allowedNames);
    const overwrites = restricted
      ? [
          { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
          ...guild.roles.cache
            .filter(role => allowedNames.includes(role.name))
            .map(role => ({
              id: role.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks
              ]
            })),
          { id: botMember.id, allow: botPermissions }
        ]
      : [];

    let category = guild.channels.cache.find(
      channel => channel.type === ChannelType.GuildCategory && channel.name === categoryName
    );
    if (!category) {
      category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: overwrites,
        reason: "BC Gold Logistics VTC setup"
      });
      categoriesCreated++;
    }

    for (const name of channelNames) {
      const type = categoryName === "🔊 COMPANY VOICE"
        ? ChannelType.GuildVoice
        : ChannelType.GuildText;
      const existing = guild.channels.cache.find(
        channel => channel.name === name && channel.type === type
      );

      // Never move or rewrite permissions on an existing channel. This preserves
      // its current history and access configuration for a separate review.
      if (existing) {
        existingChannelsLeftInPlace++;
        continue;
      }

      await guild.channels.create({
        name,
        type,
        parent: category.id,
        reason: "BC Gold Logistics VTC setup"
      });
      channelsCreated++;
    }
  }

  const ownerRole = guild.roles.cache.find(role => role.name === "Owner");
  const ownerMember = await guild.members.fetch(interaction.user.id);
  if (ownerRole && guild.ownerId === interaction.user.id &&
      !ownerMember.roles.cache.has(ownerRole.id)) {
    await ownerMember.roles.add(ownerRole, "Server owner ran BC Gold Logistics VTC setup");
  }

  const infoChannel = guild.channels.cache.find(
    channel => channel.name === "company-information" && channel.isTextBased()
  );
  let overviewPosted = false;
  if (infoChannel) {
    const overview = new EmbedBuilder()
      .setColor(0xD4AF37)
      .setTitle("BC Gold Logistics | Company Overview")
      .setDescription(
        "A multiplayer American Truck Simulator virtual trucking company built around coordinated company Convoy operations, professional driver standards, and a managed virtual fleet."
      )
      .addFields(
        { name: "Primary operation", value: "American Truck Simulator · Multiplayer Convoy" },
        { name: "Company model", value: "Multiplayer-only VTC operations. TruckersMP is not required." },
        { name: "Core departments", value: "Executive Administration · Transportation · Dispatch · Fleet Management · Human Resources · Safety & Training · Convoy Operations · Technology" },
        { name: "Driver expectations", value: "Follow company standards, attend announced company runs when scheduled, communicate respectfully, and submit accurate delivery records." },
        { name: "Platform", value: "Company website, Discord workspace, driver resources, management tools, and future verified ATS telemetry." }
      )
      .setFooter({ text: "Company capabilities and fleet records are published only when established." })
      .setTimestamp();

    const recent = await infoChannel.messages.fetch({ limit: 25 });
    const prior = recent.find(message =>
      message.author.id === botMember.id &&
      message.embeds.some(embed => embed.title === "BC Gold Logistics | Company Overview")
    );
    if (prior) await prior.edit({ embeds: [overview] });
    else await infoChannel.send({ embeds: [overview] });
    overviewPosted = true;
  }

  await interaction.editReply(
    "BC Gold Logistics VTC setup finished. " +
    rolesCreated + " roles created, " +
    categoriesCreated + " categories created, " +
    channelsCreated + " new channels created. " +
    existingChannelsLeftInPlace + " existing channels were left untouched. " +
    (overviewPosted
      ? "The company overview was posted/updated in #company-information. "
      : "The #company-information channel was not found, so no overview was posted. ") +
    "No existing roles, channels, permissions, or messages were deleted or rewritten."
  );
}

module.exports = { data, execute };
