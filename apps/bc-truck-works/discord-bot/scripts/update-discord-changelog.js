const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require("../bot/node_modules/discord.js");

require("../bot/node_modules/dotenv").config({
    path: path.join(__dirname, "..", "bot", ".env")
});

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error("❌ DISCORD_TOKEN is missing from bot/.env");
    process.exit(1);
}

const CHANGELOG_FILE = path.join(
    __dirname,
    "..",
    "CHANGELOG.md"
);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

function escapeMarkdown(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function parseChangelog(content) {
    const sections = [];
    const parts = content.split(/^## /m);

    for (const part of parts.slice(1)) {
        const lines = part.split("\n");
        const date = lines.shift()?.trim();

        if (!date) continue;

        const sectionText = lines.join("\n").trim();

        const added = [];
        const fixed = [];
        const changed = [];
        const other = [];

        let current = null;

        for (const line of lines) {
            const heading = line.match(
                /^### (✨ Added|🐛 Fixed|🔧 Changed|📝 Other)/
            );

            if (heading) {
                current = heading[1];
                continue;
            }

            const match = line.match(
                /^- (.+?) \(`([a-f0-9]+)`\)$/i
            );

            if (!match || !current) continue;

            const item = {
                text: match[1],
                hash: match[2]
            };

            if (current === "✨ Added") {
                added.push(item);
            } else if (current === "🐛 Fixed") {
                fixed.push(item);
            } else if (current === "🔧 Changed") {
                changed.push(item);
            } else {
                other.push(item);
            }
        }

        sections.push({
            date,
            added,
            fixed,
            changed,
            other
        });
    }

    return sections;
}

function makeItems(items) {
    if (!items.length) return "";

    return items
        .map(item =>
            `• ${escapeMarkdown(item.text)} \`${item.hash}\``
        )
        .join("\n");
}

function addFieldIfNeeded(embed, name, items) {
    if (!items.length) return;

    const text = makeItems(items);

    if (text.length <= 1024) {
        embed.addFields({
            name,
            value: text
        });
        return;
    }

    let chunk = "";
    let part = 1;

    for (const item of items) {
        const line =
            `• ${escapeMarkdown(item.text)} \`${item.hash}\`\n`;

        if ((chunk + line).length > 1000) {
            embed.addFields({
                name: `${name} — Part ${part}`,
                value: chunk.trim()
            });

            part++;
            chunk = "";
        }

        chunk += line;
    }

    if (chunk.trim()) {
        embed.addFields({
            name:
                part === 1
                    ? name
                    : `${name} — Part ${part}`,
            value: chunk.trim()
        });
    }
}

async function findChangelogChannel() {
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!guildId) {
        throw new Error(
            "DISCORD_GUILD_ID is missing from bot/.env"
        );
    }

    const guild = await client.guilds.fetch(guildId);

    await guild.channels.fetch();

    const channel = guild.channels.cache.find(channel => {
        if (!channel.isTextBased()) return false;

        const normalized = String(channel.name)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        return normalized === "changelog";
    });

    if (!channel) {
        throw new Error(
            "Could not find the #changelog Discord channel."
        );
    }

    return channel;
}

async function updateDiscordChangelog() {
    const content = fs.readFileSync(
        CHANGELOG_FILE,
        "utf8"
    );

    const sections = parseChangelog(content);

    if (!sections.length) {
        throw new Error(
            "CHANGELOG.md does not contain a valid changelog section."
        );
    }

    const latest = sections[0];

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("📋 BC TruckWorks Changelog")
        .setDescription(
            `Here are the latest updates to **BC TruckWorks**.\n\n` +
            `📅 **Latest Update:** ${latest.date}`
        )
        .setFooter({
            text: "BC TruckWorks • Community & Updates"
        })
        .setTimestamp();

    addFieldIfNeeded(
        embed,
        "✨ Added",
        latest.added
    );

    addFieldIfNeeded(
        embed,
        "🐛 Fixed",
        latest.fixed
    );

    addFieldIfNeeded(
        embed,
        "🔧 Changed",
        latest.changed
    );

    addFieldIfNeeded(
        embed,
        "📝 Other",
        latest.other
    );

    const channel = await findChangelogChannel();

    const messages = await channel.messages.fetch({
        limit: 100
    });

    const existing = messages.find(message =>
        message.author.id === client.user.id &&
        message.embeds.some(embed =>
            String(embed.title || "")
                .includes("BC TruckWorks Changelog")
        )
    );

    if (existing) {
        await existing.edit({
            embeds: [embed]
        });

        console.log(
            `✅ Updated existing changelog embed in #${channel.name}`
        );
    } else {
        await channel.send({
            embeds: [embed]
        });

        console.log(
            `✅ Created changelog embed in #${channel.name}`
        );
    }
}

client.once("ready", async () => {
    try {
        console.log(
            `🚛 Connected as ${client.user.tag}`
        );

        await updateDiscordChangelog();

        console.log(
            "=========================================="
        );
        console.log(
            "✅ DISCORD CHANGELOG UPDATE COMPLETE"
        );
        console.log(
            "=========================================="
        );
    } catch (error) {
        console.error(
            "❌ Discord changelog update failed:",
            error
        );

        process.exitCode = 1;
    } finally {
        client.destroy();
    }
});

client.login(TOKEN);
