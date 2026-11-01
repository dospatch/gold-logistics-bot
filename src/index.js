require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const commands = [
 require("./commands/setup-company"), require("./commands/apply"),
 require("./commands/convoy"), require("./commands/delivery"),
 require("./commands/roster"), ...Object.values(require("./commands/review"))
];
if (!process.env.DISCORD_TOKEN) throw new Error("Missing DISCORD_TOKEN environment variable.");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection(commands.map(c => [c.data.name, c]));
client.once(Events.ClientReady, c => console.log(`BC Gold Logistics Bot online as ${c.user.tag}`));
client.on(Events.InteractionCreate, async i => {
 if (!i.isChatInputCommand()) return;
 const command = client.commands.get(i.commandName);
 if (!command) return;
 try { await command.execute(i); }
 catch (e) { console.error(e); const msg={content:"Something went wrong. Contact company management.",ephemeral:true}; if(i.replied||i.deferred) await i.followUp(msg); else await i.reply(msg); }
});
client.login(process.env.DISCORD_TOKEN);
