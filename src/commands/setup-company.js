const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

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
  ["Safety & Training Director", 0xC0392B],
  ["Department Manager", 0xB8860B],
  ["Shift Manager", 0xA67C52],
  ["Supervisor", 0xA67C52],
  ["Dispatcher", 0x1F8A70],
  ["Fleet Coordinator", 0x3498DB],
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
  "🏁 START HERE": [
    "welcome", "announcements", "company-information", "company-rules",
    "driver-handbook", "frequently-asked-questions"
  ],
  "📝 RECRUITMENT & HUMAN RESOURCES": [
    "open-positions", "how-to-apply", "application-support", "onboarding",
    "hr-announcements"
  ],
  "🔒 HR PRIVATE": [
    "applications-review", "employee-records", "hr-team", "loa-reviews"
  ],
  "🚛 DRIVER OPERATIONS": [
    "driver-check-in", "driver-chat", "driver-resources",
    "delivery-logs", "driver-support", "leave-requests"
  ],
  "🚚 FLEET MANAGEMENT": [
    "fleet-overview", "vehicle-assignments", "maintenance-reports",
    "fleet-coordination"
  ],
  "📦 DISPATCH & FREIGHT": [
    "dispatch-board", "load-assignments", "active-deliveries",
    "delivery-confirmations", "dispatch-reports"
  ],
  "🗓️ CONVOY OPERATIONS": [
    "convoy-announcements", "convoy-schedule", "route-briefings",
    "convoy-chat", "convoy-media"
  ],
  "🦺 SAFETY & TRAINING": [
    "safety-announcements", "training-resources", "driver-training",
    "incident-reports"
  ],
  "💬 COMPANY COMMUNITY": [
    "general-chat", "truck-showcase", "screenshots-and-media",
    "suggestions", "off-topic"
  ],
  "🔒 LEADERSHIP": [
    "executive-office", "management-chat", "department-reports",
    "company-planning"
  ],
  "🔊 COMPANY VOICE": [
    "company-lounge", "driver-room", "convoy-staging",
    "convoy-channel-1", "convoy-channel-2", "dispatch-room",
    "training-room", "management-meeting", "afk"
  ]
};

const privateAccess = {
  "🔒 HR PRIVATE": [
    "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
    "Executive Director", "HR Director", "Recruiter"
  ],
  "🔒 LEADERSHIP": [
    "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
    "Executive Director", "HR Director", "Transportation Director",
    "Fleet Director", "Dispatch Director", "Safety & Training Director",
    "Department Manager"
  ]
};

const staffRoles = [
  "Owner", "President", "Chief Executive Officer", "Chief Operating Officer",
  "Executive Director", "HR Director", "Transportation Director", "Fleet Director",
  "Dispatch Director", "Safety & Training Director", "Department Manager",
  "Shift Manager", "Supervisor", "Dispatcher", "Fleet Coordinator",
  "Driver Trainer", "Convoy Coordinator", "Safety Officer", "Recruiter"
];

const data = new SlashCommandBuilder()
  .setName("setup-company")
  .setDescription("Build the BC Gold Logistics ATS Convoy VTC Discord structure.")
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
  let existingChannelsReused = 0;
  const errors = [];

  for (const [name, color] of roles) {
    if (!guild.roles.cache.some(role => role.name === name)) {
      try {
        await guild.roles.create({ name, color, reason: "BC Gold Logistics VTC structure" });
        rolesCreated++;
      } catch (error) {
        errors.push("Role " + name + ": " + error.message);
      }
    }
  }

  await guild.roles.fetch();
  await guild.channels.fetch();

  const botPermissions = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ManageChannels
  ];

  for (const [categoryName, channelNames] of Object.entries(layout)) {
    const allowedNames = privateAccess[categoryName];
    const isPrivate = Array.isArray(allowedNames);
    const overwrites = isPrivate
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
      try {
        category = await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          permissionOverwrites: overwrites,
          reason: "BC Gold Logistics VTC structure"
        });
        categoriesCreated++;
      } catch (error) {
        errors.push("Category " + categoryName + ": " + error.message);
        continue;
      }
    }

    for (const name of channelNames) {
      const type = categoryName === "🔊 COMPANY VOICE"
        ? ChannelType.GuildVoice
        : ChannelType.GuildText;
      let existing = guild.channels.cache.find(
        channel => channel.name === name && channel.type === type
      );

      if (existing) {
        try {
          if (existing.parentId !== category.id) {
            await existing.setParent(category.id, { lockPermissions: true, reason: "Organize BC Gold Logistics VTC channels" });
          }
          existingChannelsReused++;
        } catch (error) {
          errors.push("Channel " + name + ": " + error.message);
        }
        continue;
      }

      try {
        await guild.channels.create({
          name,
          type,
          parent: category.id,
          reason: "BC Gold Logistics VTC structure"
        });
        channelsCreated++;
      } catch (error) {
        errors.push("Channel " + name + ": " + error.message);
      }
    }
  }

  await guild.roles.fetch();
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
      .setDescription("A multiplayer American Truck Simulator virtual trucking company built around coordinated company Convoy operations, professional driver standards, and a managed virtual fleet.")
      .addFields(
        { name: "Primary operation", value: "American Truck Simulator · Multiplayer Convoy" },
        { name: "Company model", value: "Multiplayer-only VTC operations. TruckersMP is not required." },
        { name: "Departments", value: "Leadership · Human Resources · Driver Operations · Fleet Management · Dispatch · Convoy Operations · Safety & Training" },
        { name: "Driver expectations", value: "Follow company standards, attend announced company runs when scheduled, communicate respectfully, and submit accurate delivery records." },
        { name: "Company platforms", value: "Discord, company website, driver resources, management tools, and future verified ATS telemetry." }
      )
      .setFooter({ text: "Company capabilities and fleet records are published only when established." })
      .setTimestamp();

    try {
      const recent = await infoChannel.messages.fetch({ limit: 25 });
      const prior = recent.find(message =>
        message.author.id === botMember.id &&
        message.embeds.some(embed => embed.title === "BC Gold Logistics | Company Overview")
      );
      if (prior) await prior.edit({ embeds: [overview] });
      else await infoChannel.send({ embeds: [overview] });
      overviewPosted = true;
    } catch (error) {
      errors.push("Company overview: " + error.message);
    }
  }

  const summary = [
    "BC Gold Logistics VTC setup finished.",
    rolesCreated + " roles created.",
    categoriesCreated + " categories created.",
    channelsCreated + " channels created.",
    existingChannelsReused + " existing channels organized into the new layout.",
    overviewPosted ? "Company overview published in #company-information." : "Company overview could not be published."
  ];
  if (errors.length) {
    summary.push(errors.length + " setup items need attention. Check Render logs for details.");
    console.error("BC Gold Logistics setup issues:", errors);
  }
  await interaction.editReply(summary.join(" "));
}

module.exports = { data, execute };
