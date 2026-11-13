const fs = require("fs");
const { execSync } = require("child_process");

function run(command) {
    return execSync(command, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
    }).trim();
}

function escapeMarkdown(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

const file = "CHANGELOG.md";
const today = new Date().toISOString().slice(0, 10);

let existing = "";

if (fs.existsSync(file)) {
    existing = fs.readFileSync(file, "utf8");
}

if (!existing.trim()) {
    existing =
        "# 🚛 BC TruckWorks Changelog\n\n" +
        "All notable changes to BC TruckWorks are documented here.\n\n" +
        "---\n\n";
}

const existingHashes = new Set(
    [...existing.matchAll(
        /\(`([a-f0-9]{7,40})`\)/gi
    )].map(match => match[1].toLowerCase())
);

let log = "";

try {
    log = run(
        "git log -50 --pretty=format:%s%x09%h"
    );
} catch {
    log = "";
}

const commits = log
    ? log
        .split("\n")
        .map(line => {
            const [subject, hash] =
                line.split("\t");

            return {
                subject: String(subject || "").trim(),
                hash: String(hash || "").trim()
            };
        })
        .filter(commit =>
            commit.subject &&
            commit.hash
        )
    : [];

const newCommits = commits.filter(commit =>
    !existingHashes.has(
        commit.hash.toLowerCase()
    )
);

if (!newCommits.length) {
    console.log(
        `ℹ️ No new changelog commits detected for ${today}.`
    );
    process.exit(0);
}

const added = [];
const fixed = [];
const changed = [];
const other = [];

for (const commit of newCommits) {
    const lower =
        commit.subject.toLowerCase();

    if (
        lower.startsWith("feat") ||
        lower.startsWith("add") ||
        lower.startsWith("create") ||
        lower.startsWith("new")
    ) {
        added.push(commit);
    } else if (
        lower.startsWith("fix") ||
        lower.startsWith("bug") ||
        lower.startsWith("repair")
    ) {
        fixed.push(commit);
    } else if (
        lower.startsWith("update") ||
        lower.startsWith("change") ||
        lower.startsWith("refactor") ||
        lower.startsWith("improve") ||
        lower.startsWith("remove")
    ) {
        changed.push(commit);
    } else {
        other.push(commit);
    }
}

function section(title, items) {
    if (!items.length) return "";

    return (
        `### ${title}\n\n` +
        items
            .map(item =>
                `- ${escapeMarkdown(item.subject)} (\`${item.hash}\`)`
            )
            .join("\n") +
        "\n\n"
    );
}

let body = "";

body += section("✨ Added", added);
body += section("🐛 Fixed", fixed);
body += section("🔧 Changed", changed);
body += section("📝 Other", other);

const entry =
    `## ${today}\n\n` +
    body +
    "---\n\n";

const headerEnd = existing.indexOf("---");

if (headerEnd !== -1) {
    const header =
        existing
            .slice(0, headerEnd + 3)
            .trimEnd();

    const rest =
        existing
            .slice(headerEnd + 3)
            .trimStart();

    fs.writeFileSync(
        file,
        header +
        "\n\n" +
        entry +
        rest
    );
} else {
    fs.writeFileSync(
        file,
        existing.trimEnd() +
        "\n\n" +
        entry
    );
}

console.log(
    `✅ CHANGELOG.md updated with ${newCommits.length} new commit(s).`
);
