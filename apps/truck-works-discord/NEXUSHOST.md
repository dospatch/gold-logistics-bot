# NexusHost Deployment — BC TRUCK WORKS

## Exact production package

This repository's **main** branch is the production source for the BC TRUCK WORKS Discord bot.

- Repository: `dospatch/truckWorks`
- Branch: `main`
- Runtime: Node.js 22+
- Main file: `index.js`
- Start command: `npm start`
- Entry command: `node index.js`
- Dependency file: `package.json`

The root `index.js` is the complete Discord bot. NexusHost must launch this file directly.

## NexusHost GitHub Integration

In NexusHost, connect:

- Repository: `dospatch/truckWorks`
- Branch: `main`
- Main file: `index.js`

The NexusHost GitHub Integration should show the repository as **connected** before deploying.

If NexusHost exposes these startup variables, use:

- `AUTO_UPDATE=1`
- `MAIN_FILE=index.js`
- `BRANCH=main`

Do not point the server at the old `bot/src` application.

## NexusHost Variables

Set these in NexusHost. **Never put the real Discord token in GitHub.**

- `DISCORD_TOKEN` — your Discord bot token
- `DISCORD_CLIENT_ID` — `1556044045195935775`
- `DISCORD_GUILD_ID` — `1546265801500266611`
- `TRUCKWORKS_WEBSITE_URL` — `https://truck-works.vercel.app`

## Production entry point

The production entry point is:

```
/home/container/index.js
```

It must be the self-contained BC TRUCK WORKS bot.

Do **not** use:

```
require("./bot/src/index.js");
bot/src/index.js
./commands/status
```

Those references belong to the old bot structure and are not part of the production package.

## Dependencies

NexusHost should install dependencies from the root `package.json`.

Do not manually upload `node_modules`.

The production dependency is:

```
discord.js ^14.27.0
```

## Expected startup

After a successful deployment and restart, the console should include:

```
========================================
BC TRUCK WORKS DISCORD BOT
Logged in as: ...
Bot ID: ...
Server count: ...
========================================
Registered 4 Discord slash commands.
BC TRUCK WORKS BOT IS ONLINE
```

## Discord test order

After the bot is online:

1. `/status`
2. `/truckworks`
3. `/telemetry`
4. `/setup` **last**

`/setup` rebuilds the Discord server channels, so it should only be used after the bot is confirmed online.

## Important

The current `main` branch already contains the correct root `index.js` and `package.json`.

If NexusHost still starts `require("./bot/src/index.js");`, NexusHost is running a stale local copy or is not connected/deploying from `dospatch/truckWorks` `main`.
