# BC Gold Logistics — Automatic Delivery Companion

This small program runs on each driver's Windows PC while American Truck Simulator (ATS) or Euro Truck Simulator 2 (ETS2) is open. It listens for the game's SCS telemetry events and automatically reports job starts and completed deliveries to the BC Gold Logistics Discord bot.

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

The companion does not control the game or read unrelated files. It sends only the delivery event fields listed in `index.js` to the BC Gold Logistics bot.

## Important

The bot host cannot directly read a driver's local game telemetry. Every driver who wants automatic tracking must run this small companion locally and have the SCS telemetry plugin installed. This repository contains the companion source; it does not install the game plugin automatically.
