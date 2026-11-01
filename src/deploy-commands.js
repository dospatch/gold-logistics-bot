require("dotenv").config();
const { REST, Routes } = require("discord.js");
const commands = [
 require("./commands/setup-company"), require("./commands/apply"),
 require("./commands/convoy"), require("./commands/delivery"),
 require("./commands/roster"), ...Object.values(require("./commands/review"))
].map(c => c.data.toJSON());
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) throw new Error("Set DISCORD_TOKEN, CLIENT_ID, and GUILD_ID.");
new REST({version:"10"}).setToken(process.env.DISCORD_TOKEN)
 .put(Routes.applicationGuildCommands(process.env.CLIENT_ID,process.env.GUILD_ID),{body:commands})
 .then(()=>console.log("Guild slash commands registered.")).catch(console.error);
