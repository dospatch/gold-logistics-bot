# BC Truck Works

BC Truck Works is a division of BC Gold Logistics. Its applications are maintained together here while retaining independent runtime and deployment boundaries.

## Components

| Folder | Responsibility |
|---|---|
| `platform/` | Driver hub, fleet/dispatch tools, telemetry connector and core platform |
| `live-companion/` | ATS/ETS2 telemetry dashboard, web companion and optional Windows desktop companion |
| `discord-bot/` | Truck Works Discord bot and supporting app/database packages |

## Important

- Start and deploy each component from its own folder.
- Do not combine their dependency trees or run duplicate Discord bots against the same server.
- Keep credentials in deployment environment variables, never in Git.
- Original source repositories remain unchanged as rollback copies until the central deployments are verified.

See [the monorepo application guide](../../docs/MONOREPO-APPS.md) for setup and deployment instructions.
