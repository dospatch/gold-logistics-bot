// Single source of truth for every BC Gold Logistics guild slash command.
// Both the running bot and the manual deploy script import this registry.
const commandModules = [
  require("./setup-company"),
  require("./reset-company"),
  require("./apply"),
  require("./convoy"),
  require("./delivery"),
  require("./roster"),
  require("./convoy-cancel"),
  require("./load"),
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
