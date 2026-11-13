const { Client, GatewayIntentBits, ActivityType, ChannelType, PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const { organize: organizePermissions } = require("./discordPermissions");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1556044045195935775";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1546265801500266611";
const WEBSITE_URL = process.env.TRUCKWORKS_WEBSITE_URL || "https://bcttruckworks.vercel.app";
const COMMAND_BUILD = "2026-10-06-welcome-members-v1";

if (!TOKEN) {
  console.error("DISCORD_TOKEN is missing.");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const layout = [
  ["🚛 BC TRUCK WORKS • START HERE", ["👋│welcome","📜│community-guidelines","📢│announcements","📌│server-info","📊│bot-status","💡│suggestions"]],
  ["💬 COMMUNITY", ["💬│general","🚛│truck-talk","📸│screenshots","🎥│streamers"]],
  ["🛣️ DRIVING • ATS / ETS2", ["🇺🇸│ats","🇪🇺│ets2","📡│telemetry","🖥️│connector","👤│driver-hub","📏│miles-and-trips","⛽│fuel-and-rest","🧭│navigation"]],
  ["◎ CONVOYS", ["📅│convoy-events","🚦│convoy-lobby","📡│convoy-live","🗺️│convoy-routes","🏆│leaderboard"]],
  ["🏢 VTC • COMPANY", ["🏢│vtc","🏢│fleets","📋│dispatch","💰│earnings","📈│career","🧾│trip-reports"]],
  ["🆘 SUPPORT", ["🎫│support","🐛│bug-reports","📡│telemetry-help","💻│technical-help"]],
  ["🎙️ VOICE • DRIVERS", ["🚛│Truckers","◎│Convoy 1","◎│Convoy 2","🎙️│Driver Lounge","🔊│Dispatch"]],
  ["🔒 STAFF • TRUCK WORKS", ["🔒│staff-chat","📋│staff-logs","🚨│alerts","🛠️│development","🗃️│admin"]]
];

const messages = {
  "📢│announcements": "# 🚛 BC TRUCK WORKS\n\nWelcome to BC TRUCK WORKS!\n\nBuilt for ATS, ETS2, convoys, VTC operations, driver progression and telemetry.",
  "📌│server-info": "# 📌 SERVER INFO\n\nWebsite: " + WEBSITE_URL + "\n\n🇺🇸 ATS • 🇪🇺 ETS2\n🚛 Driving • 📡 Telemetry • ◎ Convoys • 🏢 VTC • 🏆 Leaderboards",
  "📡│telemetry": "# 📡 TELEMETRY\n\nTelemetry is collected on the driver's gaming PC through a telemetry provider and the BC TRUCK WORKS Driver Agent.\n\nExpected endpoint: http://127.0.0.1:25555/api/ets2/telemetry\n\nThe Discord bot cannot directly read ATS / ETS2 telemetry.",
  "📡│telemetry-help": "# 📡 TELEMETRY HELP\n\n1. Run ATS/ETS2.\n2. Run your telemetry provider.\n3. Run the Driver Agent.\n4. Check the local telemetry endpoint.\n5. Restart telemetry if needed.\n\nNeed help? Use #🎫│support."
};


function panelFor(name) {
  const data = {
    "👋│welcome": ["🚛 WELCOME TO BC TRUCK WORKS","**Serious Trucking. Connected Drivers.**\n\nWelcome to the official BC TRUCK WORKS community for ATS, ETS2, convoys, virtual trucking fleets, telemetry, and driver tracking.\n\n**🚦 GET STARTED**\n• 📜 Read the Community Guidelines\n• 👤 Open Driver Hub\n• 🖥️ Set up the Windows Connector\n• 📡 Connect ATS/ETS2 telemetry\n• 🚛 Join the community and convoys."],
    "📢│announcements": ["📢 BC TRUCK WORKS ANNOUNCEMENTS","Official updates, releases, maintenance notices, community events, and major BC TRUCK WORKS news will be posted here.\n\n🔔 Turn on notifications to stay up to date."],
    "👤│driver-hub": ["👤 BC DRIVER HUB","Your central trucking dashboard for driver statistics, trips, mileage, fleets, and supported live telemetry."],
    "📡│telemetry": ["📡 BC TRUCK WORKS TELEMETRY","**01 • GAME** — Start ATS or ETS2.\n**02 • TELEMETRY** — Start a supported provider.\n**03 • CONNECTOR** — Start the BC TRUCK WORKS Windows Connector.\n**04 • DRIVER HUB** — Verify your connection.\n**05 • DRIVE** — Start trucking and let supported telemetry update your data."],
    "🖥️│connector": ["🖥️ BC TRUCK WORKS WINDOWS CONNECTOR","The Windows Connector runs alongside ATS/ETS2 and sends supported telemetry to BC TRUCK WORKS.\n\n**CHECK BEFORE STARTING**\n✅ ATS/ETS2 installed\n✅ Telemetry provider configured\n✅ Connector installed\n✅ Driver ID configured\n✅ Connector running\n\nIf you stay disconnected, open Technical or Telemetry Support."],
    "👤│driver-hub": ["👤 BC DRIVER HUB","Your central dashboard for driver profiles, trips, mileage, fleets, statistics, and supported live telemetry.\n\n**GET STARTED**\n1. Open Driver Hub.\n2. Sign in.\n3. Complete your driver profile.\n4. Connect supported telemetry.\n5. Start driving."],
    "🏢│fleets": ["🏢 BC TRUCK WORKS FLEETS","Build your trucking career with a virtual fleet. Drivers can build profiles and fleet owners can manage drivers, activity, trips, and progress."],
    "🎫│support": ["🛠️ BC TRUCK WORKS SUPPORT","🆘 **General Support** — Driver Hub, accounts, community questions.\n🐛 **Bug Report** — Problems or unexpected behavior.\n📡 **Telemetry Help** — ATS/ETS2, Connector, mileage, or driver data.\n💻 **Technical Help** — Website, bot, installer, or setup."],
    "📡│telemetry-help": ["📡 TELEMETRY HELP","**1.** Start ATS/ETS2.\n**2.** Start your telemetry provider.\n**3.** Start the BC TRUCK WORKS Connector.\n**4.** Confirm the Connector is online.\n**5.** Check Driver Hub for incoming data."],
    "🐛│bug-reports": ["🐛 BUG REPORTS","Report the game, steps to reproduce, screenshots/logs, and what you expected to happen. Use Support to submit the issue."],
    "💻│technical-help": ["💻 TECHNICAL HELP","Get help with the website, Windows Connector, installer, Discord bot, account access, or technical setup."],
    "📜│community-guidelines": ["📜 BC TRUCK WORKS COMMUNITY GUIDELINES","**1️⃣ RESPECT** — Treat members, drivers, fleet owners, staff, and guests with respect.\n\n**2️⃣ DISCORD CONDUCT** — No spam, harassment, impersonation, disruptive behavior, or unauthorized advertising.\n\n**3️⃣ TRUCKING & ROLEPLAY** — Drive responsibly and respect convoy, fleet, and roleplay rules.\n\n**4️⃣ CHEATING & EXPLOITS** — Do not falsify telemetry, manipulate mileage, exploit bugs, or abuse platform systems.\n\n**5️⃣ ACCOUNT SECURITY** — Never share passwords, tokens, API keys, or private configuration information.\n\n**6️⃣ SUPPORT & REPORTS** — Use the correct support area and provide useful details. Do not submit knowingly false reports.\n\n**7️⃣ STAFF** — Follow reasonable staff instructions and use the proper appeal/report process for concerns.\n\n**8️⃣ ENFORCEMENT** — Violations may result in warnings, timeouts, kicks, bans, fleet restrictions, or platform restrictions.\n\n⚠️ Guidelines may be updated as BC TRUCK WORKS grows."]
  };
  const x=data[name]; if(!x) return null;
  const e=new EmbedBuilder().setTitle(x[0]).setDescription(x[1]).setColor(0x1f2937).setFooter({text:"BC TRUCK WORKS • Serious trucking. Connected drivers."}).setTimestamp();
  const links={ "👋│welcome":[["🌐 Driver Hub",WEBSITE_URL],["📜 Guidelines",WEBSITE_URL+"/community-guidelines"],["🎫 Support",WEBSITE_URL+"/support"]], "👤│driver-hub":[["🚛 Driver Hub",WEBSITE_URL]], "📡│telemetry":[["📚 Documentation",WEBSITE_URL+"/docs"],["🎫 Support",WEBSITE_URL+"/support"]], "🖥️│connector":[["📚 Connector Help",WEBSITE_URL+"/support"],["📡 Telemetry",WEBSITE_URL+"/support"]], "👤│driver-hub":[["🚛 Open Driver Hub",WEBSITE_URL]], "🎫│support":[["🎫 Open Support",WEBSITE_URL+"/support"]], "📡│telemetry-help":[["🛠️ Support",WEBSITE_URL+"/support"]], "🐛│bug-reports":[["🐛 Report an Issue",WEBSITE_URL+"/support"]], "💻│technical-help":[["💻 Get Technical Help",WEBSITE_URL+"/support"]], "📜│community-guidelines":[["🎫 Support",WEBSITE_URL+"/support"],["🌐 Driver Hub",WEBSITE_URL]]};
  if(links[name]) e.setURL(WEBSITE_URL);
  const out={embeds:[e]}; if(links[name]) out.components=[new ActionRowBuilder().addComponents(links[name].map(b=>new ButtonBuilder().setLabel(b[0]).setStyle(ButtonStyle.Link).setURL(b[1])))]; return out;
}

function statusEmbed() {
  return new EmbedBuilder()
    .setTitle("🚛 BC TRUCK WORKS • BOT STATUS")
    .setDescription("BC TRUCK WORKS Discord infrastructure is online.")
    .addFields(
      { name: "🤖 Bot", value: "🟢 Online", inline: true },
      { name: "📡 Discord", value: "🟢 Connected", inline: true },
      { name: "🌐 Website", value: WEBSITE_URL, inline: true },
      { name: "🛣️ Games", value: "ATS / ETS2", inline: true },
      { name: "📡 Telemetry", value: "Driver Agent architecture", inline: true },
      { name: "⚙️ Version", value: "2.0.0", inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BC TRUCK WORKS" });
}

async function updateStatus() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = guild.channels.cache.find(c => c.name === "📊│bot-status" && c.type === ChannelType.GuildText);
    if (!channel) return;
    const old = await channel.messages.fetch({ limit: 20 });
    for (const m of old.values()) if (m.author.id === client.user.id) await m.delete().catch(() => {});
    await channel.send({ embeds: [statusEmbed()] });
  } catch (e) {
    console.error("Status update:", e.message);
  }
}

async function sendMemberWelcome(member) {
  if (!member.guild || member.guild.id !== GUILD_ID || member.user.bot) return;
  try {
    const channel = member.guild.channels.cache.find(
      c => c.name === "👋│welcome" && c.type === ChannelType.GuildText
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x168cff)
      .setTitle("🚛 Welcome to BC TRUCK WORKS!")
      .setDescription(
        "👋 Welcome " + member + "!\n\n" +
        "We're glad you're here. You're now part of the BC TRUCK WORKS trucking community for **ATS, ETS2, convoys, VTCs, telemetry, and driver progression**.\n\n" +
        "📜 **Start here:** Read the Community Guidelines.\n" +
        "👤 **Set up:** Visit Driver Hub and complete your driver profile.\n" +
        "🚛 **Get involved:** Join truck talk, convoys, and the community.\n" +
        "🆘 **Need help?** Use Support and we'll help you get rolling.\n\n" +
        "🛣️ **Welcome aboard, driver. Let's hit the road!**"
      )
      .setThumbnail(member.user.displayAvatarURL({ extension: "png", size: 256 }))
      .setFooter({ text: "BC TRUCK WORKS • Serious trucking. Connected drivers." })
      .setTimestamp();

    await channel.send({ content: "🎉 **A new driver just joined BC TRUCK WORKS!**", embeds: [embed] });
  } catch (e) {
    console.error("Member welcome:", e.message);
  }
}

async function setup(interaction) {
  if (!interaction.guild) return interaction.reply({ content: "❌ Use this command inside the server.", ephemeral: true });
  if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "❌ Administrator permission is required.", ephemeral: true });
  await interaction.deferReply({ ephemeral: true });

  const me = interaction.guild.members.me;
  if (!me || !me.permissions.has(PermissionFlagsBits.ManageChannels)) return interaction.editReply("❌ I need Manage Channels permission.");

  try {
    await interaction.editReply("🛠️ Adding/updating BC TRUCK WORKS channels...");

    let categoriesCreated = 0;
    let channelsCreated = 0;
    let channelsUpdated = 0;

    for (const [categoryName, channelNames] of layout) {
      let category = interaction.guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name === categoryName
      );

      if (!category) {
        category = await interaction.guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          reason: "BC TRUCK WORKS add/update setup"
        });
        categoriesCreated++;
      }

      for (const name of channelNames) {
        const voice = ["🚛│Truckers","◎│Convoy 1","◎│Convoy 2","🎙️│Driver Lounge","🔊│Dispatch"].includes(name);
        const type = voice ? ChannelType.GuildVoice : ChannelType.GuildText;

        let channel = interaction.guild.channels.cache.find(
          c => c.name === name && c.type === type
        );

        if (!channel) {
          channel = await interaction.guild.channels.create({
            name,
            type,
            parent: category.id,
            reason: "BC TRUCK WORKS add/update setup"
          });
          channelsCreated++;
        } else {
          if (channel.parentId !== category.id && channel.manageable) {
            await channel.setParent(category.id, { lockPermissions: false, reason: "BC TRUCK WORKS add/update setup" });
            channelsUpdated++;
          }
        }

        if (type === ChannelType.GuildText) {
          const p = panelFor(name);
          if (p) {
            const recent = await channel.messages.fetch({ limit: 25 }).catch(() => new Map());
            const botMessages = [...recent.values()].filter(m => m.author.id === client.user.id);

            if (botMessages.length === 0) {
              await channel.send(p);
              channelsUpdated++;
            }
          } else if (messages[name]) {
            const recent = await channel.messages.fetch({ limit: 25 }).catch(() => new Map());
            const botMessages = [...recent.values()].filter(m => m.author.id === client.user.id);

            if (botMessages.length === 0) {
              await channel.send(messages[name]);
              channelsUpdated++;
            }
          }
        }
      }
    }

    await organizePermissions(interaction.guild, layout);

    await interaction.editReply(
      "✅ BC TRUCK WORKS Add/Update complete!\n" +
      "📁 Categories created: " + categoriesCreated + "\n" +
      "💬 Channels created: " + channelsCreated + "\n" +
      "🔄 Channels/panels updated: " + channelsUpdated + "\n\n" +
      "🛡️ Existing channels were NOT deleted.\n" +
      "🔐 Categories, channel order, and permissions organized."
    );

    setTimeout(updateStatus, 3000);
  } catch (e) {
    console.error("SETUP ERROR:", e);
    await interaction.editReply("❌ Setup failed: " + e.message);
  }
}

const commands = [
  new SlashCommandBuilder().setName("setup").setDescription("SAFE: add or update channels without deleting existing channels.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator.toString()),
  new SlashCommandBuilder().setName("setup-v2").setDescription("SAFE SETUP V2: add/update channels without deleting anything.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator.toString()),
  new SlashCommandBuilder().setName("status").setDescription("Show bot and server status."),
  new SlashCommandBuilder().setName("truckworks").setDescription("Show BC TRUCK WORKS information."),
  new SlashCommandBuilder().setName("telemetry").setDescription("Show ATS / ETS2 telemetry information.")
].map(c => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const route = Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID);
  // Explicitly replace the guild command set so stale setup definitions cannot remain.
  await rest.put(route, { body: [] });
  await rest.put(route, { body: commands });
  console.log("Registered fresh BC TRUCK WORKS slash commands. Build:", COMMAND_BUILD);
}

client.once("ready", async () => {
  console.log("========================================");
  console.log("BC TRUCK WORKS DISCORD BOT");
  console.log("Command build:", COMMAND_BUILD);
  console.log("Logged in as:", client.user.tag);
  console.log("Bot ID:", client.user.id);
  console.log("Server count:", client.guilds.cache.size);
  console.log("========================================");
  client.user.setPresence({ activities: [{ name: "BC TRUCK WORKS • ATS / ETS2", type: ActivityType.Watching }], status: "online" });
  try { await registerCommands(); await updateStatus(); } catch (e) { console.error("Startup:", e); }
  setInterval(updateStatus, 300000);
  console.log("BC TRUCK WORKS BOT IS ONLINE");
});

client.on("guildMemberAdd", sendMemberWelcome);

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    if (interaction.commandName === "setup" || interaction.commandName === "setup-v2") return setup(interaction);
    if (interaction.commandName === "status") return interaction.reply({ embeds: [statusEmbed()] });
    if (interaction.commandName === "truckworks") return interaction.reply({ embeds: [new EmbedBuilder().setTitle("🚛 BC TRUCK WORKS").setDescription("Trucking community and driver platform for ATS and ETS2.").addFields({ name: "🌐 Website", value: WEBSITE_URL }, { name: "🛣️ Games", value: "American Truck Simulator and Euro Truck Simulator 2" }).setTimestamp()] });
    if (interaction.commandName === "telemetry") return interaction.reply({ embeds: [new EmbedBuilder().setTitle("📡 TELEMETRY").setDescription("Driver-side telemetry connects ATS / ETS2 data to BC TRUCK WORKS.").addFields({ name: "Endpoint", value: "http://127.0.0.1:25555/api/ets2/telemetry" }, { name: "Help", value: "Use #📡│telemetry-help or #🎫│support." }).setTimestamp()] });
  } catch (e) {
    console.error("Interaction:", e);
    const r = { content: "❌ Something went wrong.", ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(r).catch(() => {});
    else await interaction.reply(r).catch(() => {});
  }
});

client.on("error", e => console.error("Discord error:", e));
client.on("warn", e => console.warn("Discord warning:", e));
client.login(TOKEN).catch(e => { console.error("Discord login failed:", e); process.exit(1); });
