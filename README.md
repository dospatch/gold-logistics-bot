# BC Gold Logistics

**Driven by Excellence. Delivered with Pride.**

BC Gold Logistics is a player-run American Truck Simulator (ATS) trucking company and virtual trucking company (VTC). The company is organized around coordinated multiplayer company operations using the built-in ATS Convoy mode.

## Company operating model
- American Truck Simulator is the primary game.
- Company operations are multiplayer-only and are organized through ATS Convoy sessions.
- Official multiplayer meetups use the built-in ATS Convoy mode; TruckersMP is not required.
- Drivers apply through the public website and are added to the official roster only after management approval.
- Company-owned virtual fleet records, driver assignments, deliveries, and mileage are managed as company records.
- Company convoys and events are the core operating format; schedules and participation expectations are communicated through official company channels.
- Additional game support and new divisions are future expansion decisions, not current operating commitments.

## Discord bot commands
- `/setup-company` — creates missing company roles, categories, and channels; updates managed role colors; never deletes existing content.
- `/apply` — posts the company driver recruitment panel.
- `/convoy` — posts optional company multiplayer-session announcements.
- `/delivery` — records completed deliveries.
- `/roster` — shows members assigned to company roles.
- `/load create` — opens a freight load on the dispatch board.
- `/load assign` — assigns an approved company driver and company unit to a load.
- `/load status` — updates load progress and posts shipment / delivery updates.

## Website
- Public company information and driver recruitment.
- Discord sign-in for driver applications.
- Private application tickets for applicants and authorized recruitment staff.
- Management portal for approving, denying, holding, or requesting more information.
- Driver portal for approved community members.
- Convoy announcements and driver standards.

## Server reference
- `config/server-layout.json` — company roles, divisions, categories, and channels.
- `docs/DISCORD-SERVER.md` — server structure, policies, permissions, and security.
- `src/lib/embeds.js` — shared black-and-gold embed builder.

## Setup
Requires Node.js 20+.
1. Install dependencies with `npm install`.
2. Configure `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` in Render.
3. Configure website Discord OAuth and session secrets in Render.
4. Start with `npm start`.
5. Run `/setup-company` in the Discord server as an administrator.

Never commit bot tokens or other secrets.

## ATS telemetry
The optional `telemetry-companion` can be run locally by a driver to forward supported ATS telemetry to the company service. It is a future enhancement to the multiplayer VTC workflow. Driver mileage and delivery statistics should only be shown as verified after telemetry, identity checks, and persistent server storage are configured.
