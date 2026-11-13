# BC Gold Logistics application guide

This repository is the central source for BC Gold Logistics and its BC Truck Works division.

## Company structure

- Repository root and `website/`: BC Gold Logistics company platform and services.
- `apps/bc-truck-works/`: the complete BC Truck Works division, organized into three independently runnable components:
  - `platform/`: original BC Truck Works driver hub, telemetry/connector, fleet and dispatch platform.
  - `live-companion/`: ATS/ETS2 Live Companion web dashboard, telemetry bridge and optional Windows desktop companion.
  - `discord-bot/`: Truck Works Discord bot and its supporting app/database packages.

The three components share one division folder and central repository, but remain separate deployable processes. This avoids accidentally starting two Discord bots or mixing incompatible dependencies into one Node process.

## Local development

Run commands from each component's own directory.

```bash
# BC Gold Logistics root service
npm install
npm start

# BC Truck Works platform
cd apps/bc-truck-works/platform
npm install
npm start

# BC Truck Works Live Companion
cd apps/bc-truck-works/live-companion
npm install
npm run dev
npm run build

# BC Truck Works Discord bot
cd apps/bc-truck-works/discord-bot
npm install
npm start
```

Each component keeps its own package manifest and `.env.example`. Configure secrets in the relevant hosting service; never commit populated environment files, Discord tokens, database credentials, or webhook URLs.

## Deployment boundaries

- Keep the BC Gold Logistics website and root service on their existing deployment roots.
- Keep Live Companion as a separate Next.js deployment rooted at `apps/bc-truck-works/live-companion` after the Vercel project is reconfigured and verified.
- Keep Discord bot services separate until their command sets, server targets, and production responsibilities are reconciled. Never run duplicate bots against the same Discord server unintentionally.
- Keep the original source repositories intact as rollback references until all central deployments are verified and explicitly approved for retirement.

## Migration notes

All three source repositories were imported as Git subtrees before being grouped under this division folder. The empty `goldtrack-ats-companion.` repository remains untouched. Unrelated BCGAMING projects are excluded.

See [MONOREPO-PLAN.md](./MONOREPO-PLAN.md) for migration history and safety rules.
