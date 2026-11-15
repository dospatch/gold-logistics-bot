// BC Gold Logistics — clean guild slash-command registry.
// This is the single source of truth used by bot startup and commands:deploy.
// The registry intentionally excludes the destructive reset-company command.
const commandModules = [
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
if (names.some(name => !name)) {
  throw new Error("Every command module must export data with a slash-command name.");
}
const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
if (duplicates.length) {
  throw new Error("Duplicate slash command names: " + [...new Set(duplicates)].join(", "));
}
if (commandModules.some(command => typeof command.execute !== "function")) {
  throw new Error("Every registered slash command must export an execute() function.");
}

module.exports = commandModules;
