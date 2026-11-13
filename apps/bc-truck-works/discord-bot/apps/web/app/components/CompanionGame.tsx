"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CompanionShell } from "./CompanionShell";

type T = Record<string, any>;
type Trip = {
  id: string;
  game: string;
  truck: string;
  startedAt: number;
  endedAt?: number;
  miles: number;
  fuelStart: number | null;
  fuelEnd: number | null;
  cargo: string;
  route: string;
  income: number | null;
  startOdometerKm: number | null;
  endOdometerKm?: number | null;
  persisted?: boolean;
};

const TELEMETRY_URL = "http://127.0.0.1:25555/api/ets2/telemetry";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TRIP_KEY = "bc-truckworks-active-trip";
const HISTORY_KEY = "bc-truckworks-trip-history";
const SETTINGS_KEY = "bc-truckworks-driver-settings";

function fromApiTrip(row: any): Trip {
  return {
    id: row.id,
    game: row.game,
    truck: row.truck_name || "Truck",
    startedAt: new Date(row.started_at).getTime(),
    endedAt: row.ended_at ? new Date(row.ended_at).getTime() : undefined,
    miles: Number(row.miles || 0),
    startOdometerKm: num(row.odometer_start_km),
    endOdometerKm: num(row.odometer_end_km),
    fuelStart: num(row.fuel_start),
    fuelEnd: num(row.fuel_end),
    cargo: row.cargo || "No cargo",
    route: row.route_name || "Route not set",
    income: num(row.income),
    persisted: true,
  };
}

function pick(d: T | null, paths: string[], fallback: any = null) {
  for (const path of paths) {
    const value = path.split(".").reduce((o: any, key) => o?.[key], d as any);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function num(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mph(ms: number | null) {
  return ms === null ? null : ms * 2.236936;
}

function kmToMiles(km: number | null) {
  return km === null ? null : km * 0.621371;
}

function money(value: number | null) {
  return value === null ? "—" : "$" + Math.round(value).toLocaleString();
}

function duration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v, i) => i === 0 ? String(v) : String(v).padStart(2, "0")).join(":");
}

export function CompanionGame({ game }: { game: "ATS" | "ETS2" }) {
  const [data, setData] = useState<T | null>(null);
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voice, setVoice] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [history, setHistory] = useState<Trip[]>([]);
  const [now, setNow] = useState(Date.now());
  const [aiMessage, setAiMessage] = useState("Co-driver online. I’ll watch your speed, fuel, trip progress and route.");
  const [events, setEvents] = useState<string[]>([]);
  const activeTripRef = useRef<Trip | null>(null);
  const last = useRef({ live: false, speed: 0, odometer: null as number | null, destination: "", warned: false });

  useEffect(() => { activeTripRef.current = activeTrip; }, [activeTrip]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRIP_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      const settings = localStorage.getItem(SETTINGS_KEY);
      if (stored) setActiveTrip(JSON.parse(stored));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (settings) {
        const parsed = JSON.parse(settings);
        setVoice(parsed.voice !== false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ voice }));
  }, [voice]);

  useEffect(() => {
    if (!activeTrip) localStorage.removeItem(TRIP_KEY);
    else localStorage.setItem(TRIP_KEY, JSON.stringify(activeTrip));
  }, [activeTrip]);

  const refreshTrips = useCallback(async () => {
    if (!API_URL) return;
    try {
      const [statsResponse, historyResponse] = await Promise.all([
        fetch(API_URL + "/api/trips/stats", { credentials: "include", cache: "no-store" }),
        fetch(API_URL + "/api/trips?limit=50", { credentials: "include", cache: "no-store" }),
      ]);
      if (!statsResponse.ok || !historyResponse.ok) return;
      const stats = await statsResponse.json();
      const rows = await historyResponse.json();
      const apiHistory = Array.isArray(rows.trips) ? rows.trips.map(fromApiTrip) : [];
      setHistory(apiHistory);
      if (stats.activeTrip) setActiveTrip(current => current?.persisted ? current : fromApiTrip(stats.activeTrip));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(apiHistory));
    } catch {}
  }, []);

  useEffect(() => { refreshTrips(); }, [refreshTrips]);

  const speak = useCallback((message: string) => {
    setAiMessage(message);
    setEvents(current => [message, ...current].slice(0, 6));
    if (!voice || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.02;
    utterance.pitch = 0.95;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [voice]);

  const load = useCallback(async () => {
    try {
      const response = await fetch(TELEMETRY_URL + "?bc_ts=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("telemetry");
      const payload = await response.json();
      setData(payload);
      const connected = Boolean(payload?.game?.connected);
      const name = String(payload?.game?.gameName || "").toUpperCase();
      const isLive = connected && name.includes(game);
      setLive(isLive);

      const currentOdo = num(pick(payload, ["truck.odometer", "truckOdometer"], null));
      const currentSpeed = mph(num(pick(payload, ["truck.speed", "speed"], null))) || 0;
      const destination = String(pick(payload, ["job.destinationCity", "job.destinationCityName", "navigation.destination"], "") || "");

      if (isLive && !last.current.live) speak("Telemetry is live. I have your truck.");
      if (!isLive && last.current.live) speak("Telemetry disconnected. I’ll keep your trip saved.");

      if (isLive && currentSpeed > 0 && last.current.speed <= 0) speak("You’re moving. Trip tracking is active.");
      if (isLive && currentSpeed > 0 && valuesRef.current.limit !== null && currentSpeed > valuesRef.current.limit + 5 && !last.current.warned) {
        speak("Heads up. You’re over the current speed limit.");
        last.current.warned = true;
      }
      if (currentSpeed <= (valuesRef.current.limit ?? Infinity) + 2) last.current.warned = false;

      if (destination && destination !== last.current.destination && last.current.destination) {
        speak("Route update received. Your destination is " + destination + ".");
      }

      const trip = activeTripRef.current;
      if (isLive && trip && currentOdo !== null && trip.startOdometerKm !== null) {
        const trackedMiles = Math.max(0, (currentOdo - trip.startOdometerKm) * 0.621371);
        if (Math.abs(trackedMiles - trip.miles) > 0.01) {
          setActiveTrip(current => current ? { ...current, miles: trackedMiles } : current);
        }
      }

      last.current = { live: isLive, speed: currentSpeed, odometer: currentOdo, destination, warned: last.current.warned };
    } catch {
      setLive(false);
    }
  }, [game, speak, activeTrip]);

  const values = useMemo(() => {
    const speedMps = num(pick(data, ["truck.speed", "speed"], null));
    const limitMps = num(pick(data, ["truck.navigation.speed.limit", "navigation.speedLimit", "truck.speedLimit"], null));
    const odometer = num(pick(data, ["truck.odometer", "truckOdometer"], null));
    const fuel = num(pick(data, ["truck.fuelAmount", "truck.fuel"], null));
    const source = pick(data, ["job.sourceCity", "job.sourceCityName", "city.source"], "—");
    const destination = pick(data, ["job.destinationCity", "job.destinationCityName", "city.destination"], "—");
    return {
      truck: [pick(data, ["truck.make", "truck.brand"], ""), pick(data, ["truck.model", "truck.name"], "")].filter(Boolean).join(" ") || "Truck",
      speed: mph(speedMps),
      limit: mph(limitMps),
      odometer,
      odometerMiles: kmToMiles(odometer),
      fuel,
      rpm: num(pick(data, ["truck.rpm", "truck.engineRpm", "truck.engine.rpm"], null)),
      gear: pick(data, ["truck.gear", "truck.displayedGear", "truck.displayed.gear"], "N"),
      damage: num(pick(data, ["truck.damage"], null)),
      source,
      destination,
      cargo: pick(data, ["job.cargo", "job.cargoName"], "No active cargo"),
      distance: kmToMiles(num(pick(data, ["navigation.estimatedDistance", "job.remainingDistanceKm", "truck.navigation.distance"], null))),
      income: num(pick(data, ["job.income", "job.revenue", "job.income"], null)),
      cruise: mph(num(pick(data, ["truck.cruiseControlSpeed", "truck.cruise_control"], null))),
      parking: Boolean(pick(data, ["truck.parkingBrake", "truck.brake.parking"], false)),
      engine: Boolean(pick(data, ["truck.engineEnabled", "truck.engine.enabled"], false))
    };
  }, [data]);

  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    load();
    if (paused) return;
    const timer = window.setInterval(load, 1000);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(clock);
    };
  }, [load, paused]);

  const startTrip = async () => {
    if (!live) {
      speak("Start ATS or ETS2 first, then I can begin tracking the trip.");
      return;
    }
    const localTrip: Trip = {
      id: crypto.randomUUID(),
      game,
      truck: values.truck,
      startedAt: Date.now(),
      miles: 0,
      startOdometerKm: values.odometer,
      fuelStart: values.fuel,
      fuelEnd: values.fuel,
      cargo: String(values.cargo),
      route: String(values.source) + " → " + String(values.destination),
      income: values.income,
      persisted: false
    };

    if (API_URL) {
      try {
        const response = await fetch(API_URL + "/api/trips/start", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            game,
            truckName: values.truck,
            cargo: String(values.cargo),
            routeName: String(values.source) + " → " + String(values.destination),
            income: values.income || 0,
            odometerKm: values.odometer,
            fuel: values.fuel,
            metadata: { source: "companion" }
          })
        });
        if (response.ok) {
          const body = await response.json();
          setActiveTrip(fromApiTrip(body.trip));
          speak("Trip started. Your miles are now being saved to BC TRUCK WORKS.");
          return;
        }
      } catch {}
    }

    setActiveTrip(localTrip);
    speak("Trip started locally. I’ll keep tracking until the API is available.");
  };

  const stopTrip = async () => {
    const trip = activeTripRef.current;
    if (!trip) return;

    if (API_URL && trip.persisted) {
      try {
        const response = await fetch(API_URL + "/api/trips/end", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            odometerKm: values.odometer,
            fuel: values.fuel,
            cargo: String(values.cargo),
            routeName: String(values.source) + " → " + String(values.destination),
            income: values.income ?? undefined,
            status: "completed",
            metadata: { source: "companion" }
          })
        });
        if (response.ok) {
          const body = await response.json();
          const finished = fromApiTrip(body.trip);
          setHistory(current => [finished, ...current.filter(item => item.id !== finished.id)].slice(0, 50));
          setActiveTrip(null);
          await refreshTrips();
          speak("Trip saved permanently. " + finished.miles.toFixed(1) + " miles logged.");
          return;
        }
      } catch {}
    }

    const finished: Trip = { ...trip, endedAt: Date.now(), endOdometerKm: values.odometer, fuelEnd: values.fuel };
    const next = [finished, ...history].slice(0, 50);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setActiveTrip(null);
    speak("Trip saved locally. " + finished.miles.toFixed(1) + " miles logged.");
  };

  const gameName = game === "ATS" ? "American Truck Simulator" : "Euro Truck Simulator 2";
  const miles = activeTrip?.miles || 0;
  const elapsed = activeTrip ? duration(now - activeTrip.startedAt) : "00:00:00";
  const fuelUsed = activeTrip?.fuelStart !== null && activeTrip?.fuelEnd !== null && activeTrip ? Math.max(0, activeTrip.fuelStart - (activeTrip.fuelEnd ?? activeTrip.fuelStart)) : 0;
  const overLimit = live && values.speed !== null && values.limit !== null && values.speed > values.limit + 5;

  return (
    <CompanionShell game={game}>
      <div className="companion-content tracker-page">
        <div className="tracker-topline">
          <div className={live ? "live-status" : "offline-status"}>● {live ? "LIVE TRACKING" : "WAITING FOR TELEMETRY"}</div>
          <div className="top-actions">
            <button className="small-action" onClick={() => setVoice(!voice)}>🔊 AI Voice {voice ? "ON" : "OFF"}</button>
            <button className="small-action" onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"} Telemetry</button>
          </div>
        </div>

        {!live && <div className="telemetry-warning"><strong>TRUCK NOT CONNECTED</strong><span>Start {game} with your SCS telemetry plugin. The tracker will automatically begin receiving vehicle data.</span></div>}

        <section className="tracker-hero">
          <div>
            <div className="eyebrow">BC TRUCK WORKS • {gameName.toUpperCase()}</div>
            <h2>{activeTrip ? "TRIP IN PROGRESS" : live ? "READY TO DRIVE" : "DRIVER COMMAND CENTER"}</h2>
            <p>{live ? values.truck + " • " + values.source + " → " + values.destination : "One dashboard for driving, jobs, miles, convoys and your AI co-driver."}</p>
          </div>
          <div className="tracker-hero-actions">
            {activeTrip ? <button className="hero-action danger" onClick={stopTrip}>■ End & Save Trip</button> : <button className="hero-action" onClick={startTrip}>▶ Start Trip</button>}
            <Link href="/companion/convoy" className="hero-action secondary">◎ Convoy Hub</Link>
          </div>
        </section>

        <section className="tracker-kpis">
          <article className="kpi kpi-main"><span>TRIP MILES</span><strong>{miles.toFixed(1)}</strong><small>{activeTrip ? "Miles tracked this trip" : "Start a trip to track miles"}</small></article>
          <article className="kpi"><span>SPEED</span><strong>{values.speed !== null ? Math.round(values.speed) : "—"}</strong><small>MPH {overLimit ? "• OVER LIMIT" : "• Current"}</small></article>
          <article className="kpi"><span>ODOMETER</span><strong>{values.odometerMiles !== null ? values.odometerMiles.toLocaleString(undefined,{maximumFractionDigits:1}) : "—"}</strong><small>Vehicle miles</small></article>
          <article className="kpi"><span>FUEL</span><strong>{values.fuel !== null ? values.fuel.toFixed(1) : "—"}</strong><small>{game === "ATS" ? "Gallons" : "Liters"}</small></article>
          <article className="kpi"><span>TRIP TIME</span><strong>{elapsed}</strong><small>{activeTrip ? "Recording" : "Not recording"}</small></article>
          <article className="kpi"><span>TO GO</span><strong>{values.distance !== null ? values.distance.toFixed(0) : "—"}</strong><small>Estimated miles</small></article>
        </section>

        <div className="tracker-layout">
          <div className="tracker-main">
            <section className="panel tracker-card">
              <div className="panel-header"><div><div className="eyebrow">AI CO-DRIVER</div><h3>BC Driver Intelligence</h3></div><span className={voice ? "clear-pill" : "muted"}>{voice ? "VOICE ACTIVE" : "TEXT ONLY"}</span></div>
              <div className="ai-driver">
                <div className="ai-avatar">BC</div>
                <div><strong>{aiMessage}</strong><p>I can speak when you start driving, exceed the limit, lose telemetry, change destinations, finish a trip, or need a reminder.</p></div>
              </div>
              <div className="ai-events">{events.length ? events.map((event, index) => <div key={index}><span>●</span>{event}</div>) : <div><span>●</span>Waiting for your first driving event.</div>}</div>
            </section>

            <section className="panel tracker-card">
              <div className="panel-header"><div><div className="eyebrow">ACTIVE DELIVERY</div><h3>{values.cargo}</h3></div><span className={activeTrip ? "clear-pill" : "muted"}>{activeTrip ? "TRACKING" : "READY"}</span></div>
              <div className="route-big"><div><small>FROM</small><strong>{values.source}</strong></div><b>→</b><div><small>TO</small><strong>{values.destination}</strong></div></div>
              <div className="delivery-grid">
                <div><span>REMAINING</span><b>{values.distance !== null ? values.distance.toFixed(1) + " mi" : "—"}</b></div>
                <div><span>PAY</span><b>{money(values.income)}</b></div>
                <div><span>GEAR</span><b>{values.gear}</b></div>
                <div><span>RPM</span><b>{values.rpm !== null ? Math.round(values.rpm).toLocaleString() : "—"}</b></div>
              </div>
            </section>

            <section className="panel tracker-card">
              <div className="panel-header"><div><div className="eyebrow">TRIP PERFORMANCE</div><h3>Driver Statistics</h3></div><span className="muted">LIVE</span></div>
              <div className="performance-grid">
                <div><span>MILES DRIVEN</span><strong>{miles.toFixed(1)} mi</strong></div>
                <div><span>FUEL USED</span><strong>{fuelUsed.toFixed(1)}</strong></div>
                <div><span>MAX SPEED</span><strong>{values.speed !== null ? Math.round(values.speed) + " MPH" : "—"}</strong></div>
                <div><span>SPEEDING</span><strong className={overLimit ? "danger-text" : ""}>{overLimit ? "ACTIVE" : "CLEAR"}</strong></div>
              </div>
            </section>
          </div>

          <aside className="tracker-side">
            <section className="panel tracker-card">
              <div className="eyebrow">DRIVER STATUS</div>
              <div className="status-list">
                <div><span>Telemetry</span><b className={live ? "ok" : "bad"}>{live ? "LIVE" : "OFFLINE"}</b></div>
                <div><span>Engine</span><b>{values.engine ? "RUNNING" : "OFF"}</b></div>
                <div><span>Parking Brake</span><b>{values.parking ? "ON" : "OFF"}</b></div>
                <div><span>Speed Limit</span><b>{values.limit !== null ? Math.round(values.limit) + " MPH" : "—"}</b></div>
                <div><span>Damage</span><b>{values.damage !== null ? (values.damage * 100).toFixed(1) + "%" : "—"}</b></div>
              </div>
            </section>

            <section className="panel tracker-card">
              <div className="panel-header"><div className="eyebrow">CONVOYS</div><Link href="/companion/convoy" className="panel-link">Open →</Link></div>
              <div className="convoy-preview"><div className="convoy-icon">◎</div><div><strong>Convoy Center</strong><p>Drivers, sessions, radar and pre-flight.</p></div></div>
              <Link href="/companion/convoy" className="panel-button secondary full-button">Open Convoy Hub</Link>
            </section>

            <section className="panel tracker-card">
              <div className="panel-header"><div className="eyebrow">AI CONTROLS</div><button className="panel-link" onClick={() => setAiOpen(!aiOpen)}>{aiOpen ? "Hide" : "Show"}</button></div>
              {aiOpen && <div className="ai-controls">
                <button onClick={() => speak("You’re doing good. Keep your speed smooth and stay focused on the road.")}>💬 Driver check-in</button>
                <button onClick={() => speak(values.destination !== "—" ? "Your destination is " + values.destination + ". You have " + (values.distance?.toFixed(0) || "unknown") + " miles remaining." : "No active destination is available.")}>🧭 Route update</button>
                <button onClick={() => speak("Current speed is " + (values.speed?.toFixed(0) || "unknown") + " miles per hour.")}>🚛 Speed report</button>
              </div>}
            </section>
          </aside>
        </div>

        <section className="panel tracker-card">
          <div className="panel-header"><div><div className="eyebrow">RECENT TRIPS</div><h3>Trip History</h3></div><Link href="/companion/trips" className="panel-link">Full history →</Link></div>
          {history.length === 0 ? <p className="muted history-empty">No saved trips yet. Start your first trip and BC TRUCK WORKS will keep the record in your browser.</p> :
            <div className="history-table">{history.slice(0,5).map(trip => <div className="history-row" key={trip.id}><div><strong>{trip.route}</strong><small>{trip.game} • {trip.cargo}</small></div><b>{trip.miles.toFixed(1)} mi</b><span>{trip.endedAt ? new Date(trip.endedAt).toLocaleDateString() : "Active"}</span></div>)}</div>}
        </section>
      </div>
    </CompanionShell>
  );
}
