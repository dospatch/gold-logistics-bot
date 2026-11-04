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
- `/load create` — opens a wholesale freight load on the dispatch board.
- `/load assign` — assigns an approved company driver and company unit to a load.
- `/load status` — updates load progress and posts active-shipment / delivery updates.
- `/carrier-register` — creates a private outside-carrier partner application ticket.
- `/carrier-review` — approves or declines a carrier and assigns the separate Carrier Partner role.
- `/apply` — posts the existing ATS/ETS2 driver recruitment panel.

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
## BC Logistics LLC employment and freight workflows
- `/careers/apply` — public employment application for the 12 planned corporate and operating divisions; applicants authenticate with Discord and receive a private HR ticket.
- The website management portal reviews both employee and legacy ATS/ETS2 driver applications.
- Employee applications approved through the portal receive the general `Employee` role; department-specific access is assigned by HR after onboarding.
- Outside carriers use `/carrier-register` and are reviewed separately from employee hiring. Approval grants `Carrier Partner`, not `Employee` or company-driver roles.
- Freight load records are managed in `#wholesale-load-board`; assignment and status updates are mirrored to dispatch and active-shipment channels.
- Load board records are Discord message-based. For permanent structured dispatch history and concurrent multi-user operations, a database integration is a later phase.
