# BC Gold Logistics Bot

**Driven by Excellence. Delivered with Pride.**

Discord management bot for the independent BC Gold Logistics ATS / ETS2 virtual transportation company.

## Company operating model
- Multiplayer-only official company operations.
- TruckersMP is not required.
- Company-owned virtual fleet managed through assignments and company records.
- Multiple divisions: Freight, Heavy Haul, Refrigerated, Fleet Services, and future-ready Passenger Transport.
- Passenger services are not active until suitable bus gameplay and multiplayer compatibility are verified.

## Commands
- `/setup-company` — creates missing corporate roles, categories, and channels; updates managed role colors; never deletes existing content.
- `/apply` — posts the company recruitment panel.
- `/convoy` — posts optional company multiplayer-session announcements.
- `/delivery` — records completed deliveries.
- `/roster` — shows members assigned to company roles.

## Server reference
- `config/server-layout.json` — company roles, divisions, categories, and channels.
- `docs/DISCORD-SERVER.md` — server structure, policies, permissions, and security.
- `src/lib/embeds.js` — shared black-and-gold embed builder.

## Setup
Requires Node.js 20+.
1. Install dependencies with npm install.
2. Configure DISCORD_TOKEN, CLIENT_ID, and GUILD_ID in Render.
3. Configure website OAuth and session secrets in Render.
4. Start with npm start.
5. Run /setup-company in the Discord server as an administrator.

Never commit bot tokens or other secrets.