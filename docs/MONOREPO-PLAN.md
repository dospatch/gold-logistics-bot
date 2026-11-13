# BC Gold Logistics Monorepo Consolidation

## Goal
Use this repository, `dospatch/gold-logistics-bot`, as the central home for BC Gold Logistics and its BC Truck Works systems while keeping each application independently buildable and deployable.

## Repository layout

- Existing root: BC Gold Logistics Discord bot and company configuration.
- `website/`: existing BC Gold Logistics website. Keep its current Vercel project/root unchanged during migration.
- `telemetry-companion/`: existing Gold Logistics telemetry companion.
- `apps/bc-truck-works/`: imported from `dospatch/bc-truck-works`.
- `apps/bc-truck-works-live/`: imported from `dospatch/bc-truck-works-live-companion`.
- `apps/truck-works-discord/`: imported from `dospatch/truckWorks`.
- `docs/`: architecture, migration, deployment, and operations documentation.
- `packages/shared/`: reserved for future shared contracts; do not move or rewrite application code until compatibility is proven.

## Migration rules

1. Import each source repository with Git subtree so its commit history is retained.
2. Do not overwrite the existing root, website, bot, or telemetry companion.
3. Keep each app's package manifests, lockfiles, environment examples, and deployment configuration within its own folder.
4. Never copy live secrets, populated environment files, tokens, or private credentials.
5. Do not change Vercel or Render project roots during the import.
6. Keep all source repositories intact. Do not archive, delete, rename, or redirect them as part of this migration.
7. Keep unrelated BC Gaming, PDM, GuildNest, and Brandon Books projects out of this repository.
8. Review overlapping Truck Works bot/dashboard responsibilities before merging or sharing runtime code. The three imports remain separate applications initially.

## Source repositories

| Destination | Source |
|---|---|
| `apps/bc-truck-works` | https://github.com/dospatch/bc-truck-works |
| `apps/bc-truck-works-live` | https://github.com/dospatch/bc-truck-works-live-companion |
| `apps/truck-works-discord` | https://github.com/dospatch/truckWorks |

All three sources currently use `main` as their default branch.

## Validation checklist

- [ ] All three subtree imports complete and preserve history.
- [ ] Existing root bot install/build/start checks pass.
- [ ] BC Truck Works install/build/start checks pass.
- [ ] Live Companion install/build checks pass.
- [ ] Truck Works Discord bot install/build/start checks pass.
- [ ] Environment variables are documented without exposing values.
- [ ] Vercel and Render deployments remain pointed at their original working roots until independently tested.
- [ ] A pull request is reviewed before merging the foundation branch into `main`.

## Deployment approach

This is a monorepo, not a single combined runtime. Deploy each application from its own root. The existing BC Gold Logistics website remains at `website/`; the Live Companion remains at `apps/bc-truck-works-live/`; other services retain their own deployment roots and environment configuration. Update deployment settings only after build validation and a separate approval.

## Status

The foundation branch is `monorepo-foundation`. Run the manual workflow `Import BC Truck Works repositories` from that branch to perform the history-preserving subtree imports. Review the resulting commits and run the validation checklist before merging.
