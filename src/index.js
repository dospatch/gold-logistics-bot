require("dotenv").config();
const http = require("node:http");
const { Client, GatewayIntentBits, Collection, Events, REST, Routes } = require("discord.js");

const applyCommand = require("./commands/apply");
const commandModules = [
  require("./commands/setup-company"),
  applyCommand,
  require("./commands/convoy"),
  require("./commands/delivery"),
  require("./commands/roster"),
  ...Object.values(require("./commands/review"))
];
const commandPayload = commandModules.map(command => command.data.toJSON());

for (const key of ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"]) {
  if (!process.env[key]) throw new Error("Missing " + key + " environment variable.");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection(commandModules.map(command => [command.data.name, command]));
client.once(Events.ClientReady, readyClient => {
  console.log("BC Gold Logistics Bot online as " + readyClient.user.tag);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isButton()) {
      await applyCommand.handleButton(interaction);
      return;
    }
    if (interaction.isModalSubmit()) {
      await applyCommand.handleModal(interaction);
      return;
    }
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction);
  } catch (error) {
    console.error("Interaction failed:", error);
    const message = { content: "Something went wrong. Please try again or contact company management.", ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(message).catch(() => {});
    else if (interaction.isRepliable()) await interaction.reply(message).catch(() => {});
  }
});

const port = Number(process.env.PORT || 3000);
http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ ok: true, botReady: client.isReady() }));
  }
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("BC Gold Logistics Bot is running.");
}).listen(port, "0.0.0.0", () => console.log("Health server listening on " + port));

async function start() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commandPayload }
  );
  console.log("Guild slash commands registered.");
  await client.login(process.env.DISCORD_TOKEN);
}

start().catch(error => {
  console.error("Bot startup failed:", error);
  process.exitCode = 1;
});
