# Monorepo application guide

This repository is the central source for BC Gold Logistics and the BC Truck Works applications. The imported applications remain separate deployable products; they are not one combined Node process.

## Applications

| Directory | Product | Runtime |
|---|---|---|
| Repository root | BC Gold Logistics Discord bot | Node.js; `npm start` |
| `apps/bc-truck-works` | BC Truck Works primary Discord bot and driver platform source | Node.js 20+; `npm start` |
| `apps/bc-truck-works-live` | BC Truck Works Live Companion web dashboard and optional Windows desktop app | Node.js 22; `npm run dev` / `npm run build` |
| `apps/truck-works-discord` | Separate BC Truck Works Discord bot package | Node.js 20+; `npm start` |

## Local development

Run commands from the relevant application directory.

```bash
# BC Gold Logistics bot (repository root)
npm install
npm start

# BC Truck Works bot
cd apps/bc-truck-works
npm install
npm start

# Live Companion
cd apps/bc-truck-works-live
npm install
npm run dev
# Production validation:
npm run build

# Separate Truck Works Discord bot
cd apps/truck-works-discord
npm install
npm start
```

Each app has its own `.env.example`. Copy it to the appropriate local environment file and supply secrets through the host's environment-variable settings. Never commit real Discord tokens, database credentials, webhook URLs, or populated environment files.

## Deployment boundaries

- Keep the existing BC Gold Logistics Render service at the repository root.
- Keep the Live Companion as a separate Next.js deployment rooted at `apps/bc-truck-works-live` only after its hosting project is deliberately reconfigured and verified.
- Keep both Truck Works Discord bot deployments separate until their command sets, server targets, and production responsibilities are reconciled.
- Do not deploy both Discord bots into the same process or server instance by default.
- Existing standalone source repositories remain intact as rollback references. Do not archive or delete them until production cutover is verified and explicitly approved.

## Migration notes

The three source repositories were imported as Git subtrees, preserving their commit histories. The empty `goldtrack-ats-companion.` repository was intentionally left untouched. Unrelated BCGAMING projects are not part of this monorepo.

See [MONOREPO-PLAN.md](./MONOREPO-PLAN.md) for the migration plan and safety rules.
