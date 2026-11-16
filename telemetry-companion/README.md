# BC Gold Logistics — Automatic Delivery Companion

This small program runs on each driver's Windows PC while American Truck Simulator (ATS) or Euro Truck Simulator 2 (ETS2) is open. It listens for the game's SCS telemetry events and automatically reports job starts and completed deliveries. On Windows, it also watches the ATS/ETS2 process and submits a bounded diagnostic excerpt when the game exits. A report is labelled as a suspected crash only when a crash file or strong fatal marker is present; a normal/unclear exit is not labelled a confirmed crash.

## Requirements

- Windows PC with ATS or ETS2.
- Node.js 20 or newer.
- SCS Telemetry SDK plugin installed for the game. The companion uses the open-source `trucksim-telemetry` package, which reads events from that plugin.
- A telemetry API key supplied privately by company management. Never post the key in Discord or commit it to GitHub.

## Setup

1. Install the SCS SDK telemetry plugin supported by TruckSim Telemetry.
2. Copy `.env.example` to `.env`.
3. Set `DISCORD_USER_ID` to your Discord user ID and set `GAME` to `ATS` or `ETS2`.
4. Add the private `TELEMETRY_API_KEY` provided by management.
5. Open a terminal in this folder and run:
   ```powershell
   npm install
   npm start
   ```
6. Keep this companion running while playing. It will automatically detect job starts and deliveries.

## What it reports

- Driver's Discord account
- Game (ATS / ETS2)
- Cargo and origin/destination
- Planned or completed distance when supplied by the game
- Delivery revenue, XP, time and cargo damage when supplied by the game

The companion does not control the game. It reads only `game.log.txt` and `game.crash.txt` from the configured ATS/ETS2 game folder. It sends a limited tail excerpt and matching diagnostic lines; it does not upload profiles, saves, screenshots, or the full Documents folder. Review excerpts before sharing if they contain personal paths or other identifying details.

## Crash diagnostics\n\nThe Windows monitor checks `amtrucks.exe` for ATS or `eurotrucks2.exe` for ETS2. When a game process that was observed running exits, the companion reads the latest log excerpts and posts a text report to `#game-diagnostics`. It does not claim every exit is a crash. The standard folders are `%USERPROFILE%\\Documents\\American Truck Simulator` and `%USERPROFILE%\\Documents\\Euro Truck Simulator 2`. Set `GAME_LOG_DIRECTORY` in `.env` if your Documents folder is redirected or the game uses a custom location.\n\n## Important

The bot host cannot directly read a driver's local game telemetry. Every driver who wants automatic tracking must run this small companion locally and have the SCS telemetry plugin installed. This repository contains the companion source; it does not install the game plugin automatically.
