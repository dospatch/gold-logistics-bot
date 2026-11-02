# BC Gold Logistics Bot
**Driven by Excellence. United by the Road.**

Discord management bot for the BC Gold Logistics ATS / ETS2 VTC.

## Commands
- `/setup-company` — creates missing roles, categories, and channels without deleting existing content.
- `/apply` — posts the website application panel in `#apply-to-join`.
- Website applications — applicants connect Discord, complete the website form, and receive a private ticket in the recruitment category.
- Management decisions — staff review and decide from `/management`; applicants receive updates inside their ticket, not DMs.
- `/convoy` — posts convoy announcements.
- `/delivery` — records completed deliveries.
- `/roster` — shows members assigned to company roles.

## Discord server backup and embeds
- `config/server-layout.json` — version-controlled snapshot of company roles, categories, channels, and management roles.
- `docs/DISCORD-SERVER.md` — server structure, application workflow, permissions, and security notes.
- `src/lib/embeds.js` — shared black-and-gold embed builder for consistent bot messages.
- Convoy, delivery, and roster commands use the shared embed builder; use it for future embeds too.

## Setup
Requires Node.js 20+.
1. Install dependencies: `npm install`
2. Configure `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` from `.env.example` in your host's environment variables.
3. Register guild commands: `npm run commands:deploy`
4. Start: `npm start`

Never commit the bot token. Invite permissions: Manage Channels, Manage Roles, View Channels, Send Messages, Embed Links, Read Message History, and Use Application Commands. Move the bot role above the company roles it needs to assign.


## Website application and private ticket workflow
- `website/apply` — applicant form with Discord OAuth identity verification.
- `website/app/api/apply` — creates a private application ticket visible to the applicant and authorized recruitment staff.
- `website/app/management` — management queue with approve, deny, request-information, and hold actions.
- Staff notes are posted only to the private `#management-chat`; applicant decisions and follow-up messages are posted inside the ticket. No application transcripts are sent by DM.
- The old `applications-review` channel is no longer part of the new workflow; existing channels and messages are not deleted.

## Automatic ATS / ETS2 delivery tracking
- `telemetry-companion/` — local Windows companion for each driver. It listens for SCS SDK `job-started` and `job-delivered` events and posts them to the bot automatically.
- `POST /api/telemetry/event` — authenticated telemetry intake; the bot posts start/completion embeds in `#delivery-logs`.
- Add `TELEMETRY_API_KEY` as a secret environment variable in Render. Generate a strong random value and use the same value in each driver's local `telemetry-companion/.env`. Never commit the real key.
- Drivers configure their own Discord user ID and select ATS or ETS2 in their local `.env`.
- Each driver's PC needs the SCS telemetry SDK plugin and Node.js 20+. See `telemetry-companion/README.md`.
