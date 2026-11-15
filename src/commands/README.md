# BC Gold Logistics Discord commands

This folder contains the bot's slash-command modules.

## Single source of truth

`registry.js` is the only list used to load and deploy slash commands. Add a command module to that registry before expecting it to appear in Discord.

The registry validates that every entry:
- exports a Discord slash-command builder as `data`;
- has a unique slash-command name; and
- exports an `execute()` handler.

The deploy script bulk-registers exactly the commands in this registry. A command file left out of the registry is not registered with Discord.

## Current registered commands

- `/help`
- `/setup-company`
- `/apply`
- `/convoy`
- `/convoy-cancel`
- `/delivery`
- `/load`
- `/roster`
- `/carrier-register`
- `/carrier-review`
- `/company-settings`
- `/company-embed`
- `/approve`
- `/deny`

## Safety

Do not add destructive server-wide reset commands to the production registry. Company setup is designed to add the required BC Gold Logistics structure while preserving the existing Discord server and its existing resources.
