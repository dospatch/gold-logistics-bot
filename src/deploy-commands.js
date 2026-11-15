require("dotenv").config();
const { Client, GatewayIntentBits, Events, REST, Routes } = require("discord.js");
const commands = require("./commands/registry").map(command => command.data.toJSON());

for (const key of ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"]) {
  if (!process.env[key]) throw new Error("Missing " + key + " environment variable.");
}

async function deploy() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const ready = new Promise(resolve => client.once(Events.ClientReady, resolve));
  await client.login(process.env.DISCORD_TOKEN);
  const bot = client.isReady() ? client : await ready;
  if (bot.user.id !== process.env.CLIENT_ID) {
    throw new Error("CLIENT_ID does not match the bot account authenticated by DISCORD_TOKEN. No commands were changed.");
  }
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationGuildCommands(bot.user.id, process.env.GUILD_ID), { body: commands });
  console.log("Replaced the complete BC Gold Logistics guild command list with " + commands.length + " commands:");
  for (const command of commands) console.log(" - /" + command.name);
  client.destroy();
}

deploy().catch(error => {
  console.error("Slash command deployment failed:", error);
  process.exitCode = 1;
});
