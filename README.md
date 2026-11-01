# BC Gold Logistics Bot
**Driven by Excellence. United by the Road.**

Discord management bot for the BC Gold Logistics ATS / ETS2 VTC.

## Commands
- `/setup-company` — creates missing roles, categories, and channels without deleting existing content.
- `/apply` — sends driver applications to the private management review channel.
- `/approve` and `/deny` — management application decisions.
- `/convoy` — posts convoy announcements.
- `/delivery` — records completed deliveries.
- `/roster` — shows members assigned to company roles.

## Setup
Requires Node.js 20+.
1. Install dependencies: `npm install`
2. Configure `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` from `.env.example` in your host's environment variables.
3. Register guild commands: `npm run commands:deploy`
4. Start: `npm start`

Never commit the bot token. Invite permissions: Manage Channels, Manage Roles, View Channels, Send Messages, Embed Links, Read Message History, and Use Application Commands. Move the bot role above the company roles it needs to assign.
