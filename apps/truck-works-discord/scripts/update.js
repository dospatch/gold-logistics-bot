const fs = require("fs");
const { execSync } = require("child_process");

function run(command) {
    console.log(`\n> ${command}\n`);

    execSync(command, {
        stdio: "inherit"
    });
}

function runQuiet(command) {
    try {
        return execSync(command, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"]
        }).trim();
    } catch {
        return "";
    }
}

console.log(`
╔════════════════════════════════════════════╗
║       🚛 BC TRUCKWORKS AUTO UPDATE       ║
╚════════════════════════════════════════════╝
`);

console.log("📦 Updating bot dependencies...");
run("npm --prefix bot install");

console.log("\n🔍 Checking project...");
run("git status --short");

console.log("\n🚀 Deploying Discord commands...");
run("npm --prefix bot run deploy");

console.log("\n📝 Updating CHANGELOG...");
run("node scripts/update-changelog.js");

console.log("\n📋 Updating Discord changelog embed...");
run("node scripts/update-discord-changelog.js");

console.log("\n📦 Updating project version...");

try {
    run("npm version patch --no-git-tag-version");
} catch {
    console.log("⚠️ Version update skipped.");
}

console.log("\n🔍 Preparing ALL project changes for GitHub...");

run("git add .");

console.log("\n📋 Files being committed...");
run("git status --short");

const stagedChanges = runQuiet("git diff --cached --name-only");

if (!stagedChanges) {
    console.log(`
============================================
✅ NOTHING TO COMMIT
============================================

Discord commands were deployed successfully.
GitHub already has the latest files.
`);
    process.exit(0);
}

console.log("\n💾 Creating GitHub commit...");

run(
    'git commit -m "chore: automated TruckWorks update"'
);

console.log("\n☁️ Pushing everything to GitHub...");

run("git push origin main");

console.log(`
╔════════════════════════════════════════════╗
║          ✅ UPDATE COMPLETE               ║
╠════════════════════════════════════════════╣
║ 📦 Dependencies updated                   ║
║ 🚛 Discord commands deployed              ║
║ 📝 CHANGELOG updated                      ║
║ 📦 Version updated                         ║
║ 💾 ALL project files committed            ║
║ ☁️ ALL changes pushed to GitHub            ║
╚════════════════════════════════════════════╝
`);
