require("dotenv").config();
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const execFileAsync = promisify(execFile);

const API_URL = (process.env.BCGL_API_URL || "").replace(/\/$/, "");
const API_KEY = process.env.TELEMETRY_API_KEY || "";
const DRIVER_ID = process.env.DISCORD_USER_ID || "";
const GAME = (process.env.GAME || "").toUpperCase();

if (!API_URL || !API_KEY || !/^\d{17,20}$/.test(DRIVER_ID) || !["ATS", "ETS2"].includes(GAME)) {
  console.error("Set BCGL_API_URL, TELEMETRY_API_KEY, DISCORD_USER_ID, and GAME in your .env file.");
  process.exit(1);
}

const sentEvents = new Set();
let telemetry;

function safeValue(value) {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(safeValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, safeValue(item)]));
  }
  return value;
}

function makeEventId(type, data) {
  const identity = [
    DRIVER_ID, GAME, type,
    data.jobStartingTime ?? "",
    data.citySrc ?? "",
    data.cityDst ?? "",
    data.cargoId ?? data.cargo ?? "",
    data.jobFinishedTime ?? ""
  ].join("|");
  return crypto.createHash("sha256").update(identity).digest("hex");
}

async function postEvent(type, rawData) {
  const data = safeValue(rawData || {});
  const eventId = makeEventId(type, data);
  if (sentEvents.has(eventId)) return;
  const payload = {
    eventId,
    type,
    driverId: DRIVER_ID,
    game: GAME,
    data: {
      cargo: data.cargo,
      citySrc: data.citySrc,
      cityDst: data.cityDst,
      compSrc: data.compSrc,
      compDst: data.compDst,
      plannedDistanceKm: data.plannedDistanceKm,
      jobDeliveredDistanceKm: data.jobDeliveredDistanceKm,
      jobIncome: data.jobIncome,
      jobDeliveredRevenue: data.jobDeliveredRevenue,
      jobDeliveredCargoDamage: data.jobDeliveredCargoDamage,
      jobDeliveredEarnedXp: data.jobDeliveredEarnedXp,
      jobDeliveredDeliveryTime: data.jobDeliveredDeliveryTime,
      truckMake: data.truckMake,
      truckModel: data.truckModel,
      truckBrand: data.truckBrand
    }
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(API_URL + "/api/telemetry/event", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + API_KEY },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Server returned HTTP " + response.status + ": " + await response.text());
      sentEvents.add(eventId);
      if (sentEvents.size > 500) sentEvents.delete(sentEvents.values().next().value);
      console.log(type + " sent to BC Gold Logistics.");
      return;
    } catch (error) {
      console.error("Telemetry upload attempt " + attempt + " failed:", error.message);
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 2500));
    }
  }
}


const diagnosticIds = new Set();
let gameWasRunning = false;
let gameSessionStartedAt = 0;
let monitorBusy = false;

function gameLogDirectory() {
  const documents = path.join(os.homedir(), "Documents");
  return path.join(documents, GAME === "ATS" ? "American Truck Simulator" : "Euro Truck Simulator 2");
}
function readTail(file, maxLines = 100) {
  try {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    return lines.slice(-maxLines).join("\n").slice(-6500);
  } catch { return ""; }
}
function getFindings(logText, crashText) {
  const lines = (logText + "\n" + crashText).split(/\r?\n/);
  const matches = lines.filter(line => /\b(error|warning|fatal|exception|failed|missing)\b/i.test(line));
  return [...new Set(matches.slice(-8).map(line => line.trim().slice(0, 180)))];
}
async function isGameRunning() {
  if (process.platform !== "win32") return false;
  const image = GAME === "ATS" ? "amtrucks.exe" : "eurotrucks2.exe";
  try {
    const { stdout } = await execFileAsync("tasklist", ["/FI", "IMAGENAME eq " + image, "/FO", "CSV", "/NH"], { windowsHide: true });
    return stdout.toLowerCase().includes(image);
  } catch { return false; }
}
async function uploadDiagnostic(kind) {
  const directory = gameLogDirectory();
  const logPath = path.join(directory, "game.log.txt");
  const crashPath = path.join(directory, "game.crash.txt");
  const logExcerpt = readTail(logPath, 130);
  let crashExcerpt = "";\n  try { if (fs.statSync(crashPath).mtimeMs >= gameSessionStartedAt) crashExcerpt = readTail(crashPath, 60); } catch {}
  if (!logExcerpt && !crashExcerpt) {
    console.log("No ATS/ETS2 diagnostic logs found at " + directory);
    return;
  }
  const findings = getFindings(logExcerpt, crashExcerpt);
  const reportId = crypto.createHash("sha256").update([DRIVER_ID, GAME, gameSessionStartedAt, kind].join("|")).digest("hex");
  if (diagnosticIds.has(reportId)) return;
  const fatal = /fatal error|unhandled exception|exception_access_violation|game crashed/i.test(crashExcerpt + "\n" + logExcerpt);
  const payload = {
    reportId, kind: fatal || crashExcerpt ? "crash-suspected" : kind,
    driverId: DRIVER_ID, game: GAME, detectedAt: new Date().toISOString(),
    gameVersion: ((logExcerpt + "\n" + crashExcerpt).match(/(?:Game version|version)[:= ]+([^\r\n]+)/i) || [])[1] || "",
    findings, logExcerpt, crashExcerpt
  };
  try {
    const response = await fetch(API_URL + "/api/telemetry/diagnostic", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + API_KEY },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "HTTP " + response.status);
    diagnosticIds.add(reportId);
    console.log("Game diagnostic report sent to BC Gold Logistics: " + payload.kind);
  } catch (error) {
    console.error("Game diagnostic upload failed:", error.message);
  }
}
async function monitorGame() {
  if (monitorBusy) return;
  monitorBusy = true;
  try {
    const running = await isGameRunning();
    if (running && !gameWasRunning) {
      gameSessionStartedAt = Date.now();
      console.log(GAME + " detected. Monitoring game log and crash files.");
    } else if (!running && gameWasRunning) {
      console.log(GAME + " process exited. Checking diagnostic logs...");
      await uploadDiagnostic("game-exit");
    }
    gameWasRunning = running;
  } finally { monitorBusy = false; }
}
function startGameMonitor() {
  if (process.platform !== "win32") {
    console.log("Automatic process monitoring is Windows-only; telemetry events remain available.");
    return;
  }
  console.log("Watching " + gameLogDirectory() + " for ATS/ETS2 diagnostics.");
  monitorGame().catch(error => console.error("Game monitor error:", error.message));
  setInterval(() => monitorGame().catch(error => console.error("Game monitor error:", error.message)), 5000);
}
\nasync function main() {
  const { truckSimTelemetry } = await import("trucksim-telemetry");
  telemetry = truckSimTelemetry();
  telemetry.on("connected", () => console.log("SCS telemetry connected. Waiting for an ATS/ETS2 delivery..."));
  telemetry.on("disconnected", () => console.log("SCS telemetry disconnected. Start or reopen the game to reconnect."));
  telemetry.on("job-started", data => {
    console.log("Delivery detected:", data?.cargo || "Cargo", data?.citySrc || "Unknown", "→", data?.cityDst || "Unknown");
    postEvent("job-started", data);
  });
  telemetry.on("job-delivered", data => {
    console.log("Completed delivery detected:", data?.cargo || "Cargo");
    postEvent("job-finished", data);
  });
  telemetry.on("error", error => console.error("Telemetry error:", error));
}

main().catch(error => {
  console.error("Could not start the telemetry companion:", error);
  process.exit(1);
});

process.on("SIGINT", () => {
  try { telemetry?.close?.(); } catch {}
  process.exit(0);
});
