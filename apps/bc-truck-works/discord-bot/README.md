# BC TRUCK WORKS

Production-ready Discord bot for NexusHost.

## NexusHost

- Runtime: Node.js 22+
- Main file: `index.js`
- Start command: `npm start` (equivalent to `node index.js`)
- Dependencies: `package.json`

### Environment variables

Set these in NexusHost Environment Variables. Never commit a real Discord token.

- `DISCORD_TOKEN` — required
- `DISCORD_CLIENT_ID` — `1556044045195935775`
- `DISCORD_GUILD_ID` — `1546265801500266611`
- `TRUCKWORKS_WEBSITE_URL` — `https://truck-works.vercel.app`

The bot uses the repository root `index.js`. The legacy `bot/src` launcher is not part of the production bot package.
