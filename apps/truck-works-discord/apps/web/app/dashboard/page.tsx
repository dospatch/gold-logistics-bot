"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../components/DashboardShell";

type Telemetry = Record<string, any>;

function pick(data: Telemetry | null, paths: string[], fallback: any = "—") {
  for (const path of paths) {
    const value = path.split(".").reduce((obj: any, key) => obj?.[key], data as any);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

export default function DashboardPage() {
  const [data, setData] = useState<Telemetry | null>(null);
  const [connected, setConnected] = useState(false);

  const readTelemetry = useCallback(async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:25555/api/ets2/telemetry?truckworks_ts=" +
          Date.now(),
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error("Telemetry unavailable");

      const payload = await response.json();
      setData(payload);
      setConnected(Boolean(payload?.game?.connected));
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    readTelemetry();
    const timer = window.setInterval(readTelemetry, 1000);
    return () => window.clearInterval(timer);
  }, [readTelemetry]);

  const game = pick(data, ["game.gameName"], "ATS / ETS2");
  const truck =
    [pick(data, ["truck.make"], ""), pick(data, ["truck.model"], "")]
      .filter(Boolean)
      .join(" ") || "Waiting";

  const speed = Number(pick(data, ["truck.speed"], NaN));
  const rpm = Number(
    pick(data, ["truck.engineRpm", "truck.rpm"], NaN)
  );

  const speedText = Number.isFinite(speed) ? Math.round(speed) : "—";
  const rpmText = Number.isFinite(rpm) ? Math.round(rpm).toLocaleString() : "—";

  const source = pick(
    data,
    ["job.sourceCity", "job.sourceCityName"],
    "—"
  );

  const destination = pick(
    data,
    ["job.destinationCity", "job.destinationCityName"],
    "—"
  );

  return (
    <DashboardShell title="Dashboard">
      <div className="section-title">
        <div className="eyebrow">Operations Center</div>
        <h2>BC TRUCK WORKS Dashboard</h2>
        <p>
          Your control center for ATS, ETS2, servers, VTC services,
          and live simulator telemetry.
        </p>
      </div>

      <div className="grid three">
        <article className="card stat">
          <div>
            <div className="kicker">Live telemetry</div>
            <strong>{connected ? "LIVE" : "WAITING"}</strong>
            <div className="kicker">
              {connected ? game : "Start ATS or ETS2"}
            </div>
          </div>
          <span className={"badge " + (connected ? "" : "warning")}>
            {connected ? "● Connected" : "○ Offline"}
          </span>
        </article>

        <article className="card stat">
          <div>
            <div className="kicker">Truck</div>
            <strong>{truck}</strong>
            <div className="kicker">Live vehicle</div>
          </div>
          <span className="badge">Telemetry</span>
        </article>

        <article className="card stat">
          <div>
            <div className="kicker">Speed</div>
            <strong>{speedText}</strong>
            <div className="kicker">Live telemetry value</div>
          </div>
          <span className="badge">Live</span>
        </article>
      </div>

      <div className="section">
        <div className="grid three">
          <article className="card">
            <div className="kicker">ENGINE RPM</div>
            <h3>{rpmText}</h3>
            <p>Current engine revolutions from the simulator.</p>
          </article>

          <article className="card">
            <div className="kicker">CURRENT JOB</div>
            <h3>{source} → {destination}</h3>
            <p>Live job information when supplied by telemetry.</p>
          </article>

          <article className="card">
            <div className="kicker">SIMULATOR</div>
            <h3>{game}</h3>
            <p>Detected from the local telemetry service.</p>
          </article>
        </div>
      </div>

      <div className="section">
        <div className="grid two">
          <article className="card">
            <div className="eyebrow">LIVE SIMULATOR</div>
            <h3>Actual truck data</h3>
            <p>
              BC TRUCK WORKS now polls the local ATS/ETS2 telemetry
              endpoint every second for live truck information.
            </p>
            <Link className="btn primary" href="/dashboard/telemetry">
              Open Live Telemetry
            </Link>
          </article>

          <article className="card">
            <div className="eyebrow">COMPANY NETWORK</div>
            <h3>Connect your drivers</h3>
            <p>
              Driver and fleet telemetry can be synchronized centrally
              through the authenticated TruckWorks agent once servers
              are registered.
            </p>
            <Link className="btn ghost" href="/dashboard/servers">
              Manage servers
            </Link>
          </article>
        </div>
      </div>
    </DashboardShell>
  );
}
