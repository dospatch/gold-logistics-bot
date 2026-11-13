# BC Gold Logistics Monorepo Consolidation

## Goal

Use `dospatch/gold-logistics-bot` as the central home for BC Gold Logistics and the complete BC Truck Works division.

## Repository layout

- Repository root: BC Gold Logistics bot and company services.
- `website/`: BC Gold Logistics company website.
- `telemetry-companion/`: Gold Logistics telemetry companion.
- `apps/bc-truck-works/platform/`: original BC Truck Works platform and driver hub.
- `apps/bc-truck-works/live-companion/`: ATS/ETS2 Live Companion web and desktop application.
- `apps/bc-truck-works/discord-bot/`: Truck Works Discord bot and supporting packages.
- `docs/`: architecture, migration, deployment, and operations documentation.
- `packages/shared/`: reserved for future shared contracts; no application code is moved here until compatibility is proven.

## Migration rules

1. Import each source repository with Git subtree so its commit history is retained.
2. Group all Truck Works components under one division directory without forcing them into one runtime.
3. Preserve each component's package manifests, environment examples, lockfiles, and deployment configuration.
4. Never copy live secrets, populated environment files, tokens, or private credentials.
5. Do not change Vercel or Render production roots until the replacement deployment is built and verified.
6. Keep all source repositories intact. Do not archive or delete them until production cutover is verified and explicitly approved.
7. Keep unrelated BC Gaming, PDM, GuildNest, and Brandon Books projects out of this repository.
8. Reconcile overlapping bot capabilities before combining commands or pointing multiple bots at the same Discord server.

## Source repositories

| Division component | Source repository |
|---|---|
| `platform/` | https://github.com/dospatch/bc-truck-works |
| `live-companion/` | https://github.com/dospatch/bc-truck-works-live-companion |
| `discord-bot/` | https://github.com/dospatch/truckWorks |

The original repositories remain available as rollback references.

## Validation checklist

- [x] All three source applications imported into the central repository.
- [x] All three applications grouped under `apps/bc-truck-works/`.
- [ ] Root BC Gold Logistics install/build/start checks pass.
- [ ] Truck Works platform install/build/start checks pass.
- [ ] Live Companion production build passes from its new path.
- [ ] Discord bot syntax/install/start checks pass from its new path.
- [ ] Vercel and Render deployment roots are reconfigured and verified individually.
- [ ] Duplicate bot responsibilities and production server targets are reconciled.

## Deployment approach

This is one repository and one company/division structure, not one combined runtime. Each component continues to deploy from its own subdirectory. Existing production deployments remain unchanged until the new roots are tested and cutover is approved.

## Status

The consolidation branch is `truck-works-unified`. It groups the three imported Truck Works applications beneath one division directory while preserving their internal project roots and source files.
