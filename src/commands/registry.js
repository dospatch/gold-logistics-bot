// BC Gold Logistics — single source of truth for the complete guild slash-command set.
// Discord's bulk-overwrite endpoint replaces the old command list with exactly this registry.
const commandModules = [
  require("./help"),
  require("./setup-company"),
  require("./apply"),
  require("./convoy"),
  require("./convoy-cancel"),
  require("./delivery"),
  require("./load"),
  require("./roster"),
  require("./carrier-register"),
  require("./carrier-review"),
  require("./company-settings"),
  require("./company-embed"),
  ...Object.values(require("./review"))
];

const names = commandModules.map(command => command?.data?.name);
if (names.some(name => !name)) throw new Error("Every command must export a slash-command builder.");
const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
if (duplicates.length) throw new Error("Duplicate slash command names: " + [...new Set(duplicates)].join(", "));
if (commandModules.some(command => typeof command.execute !== "function")) {
  throw new Error("Every registered command must export execute().");
}

module.exports = commandModules;
