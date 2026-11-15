require("dotenv").config();
const { REST, Routes } = require("discord.js");
const commands = require("./commands/registry").map(command => command.data.toJSON());

for (const key of ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"]) {
  if (!process.env[key]) throw new Error("Missing " + key + " environment variable.");
}

async function deploy() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log("Registered " + commands.length + " BC Gold Logistics guild slash commands:");
  for (const command of commands) console.log(" - /" + command.name);
}

deploy().catch(error => {
  console.error("Slash command deployment failed:", error);
  if (error.status === 401 || error.code === 0) {
    console.error("Discord rejected authentication. Check Render DISCORD_TOKEN, CLIENT_ID, and GUILD_ID. Use the Bot Token from the same Discord application; do not include the word 'Bot' in the value.");
  }
  process.exitCode = 1;
});
