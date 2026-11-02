require("dotenv").config();
const crypto = require("node:crypto");

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

async function main() {
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
