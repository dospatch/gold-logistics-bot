"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanionShell } from "../../components/CompanionShell";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Trip = {
  id: string;
  game: string;
  status: string;
  truck_name: string | null;
  cargo: string | null;
  route_name: string | null;
  income: number;
  miles: number;
  started_at: string;
  ended_at: string | null;
};

export default function Page() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading saved trips...");

  useEffect(() => {
    fetch(API_URL + "/api/trips?limit=100", { credentials: "include", cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Authentication required");
        const body = await response.json();
        setTrips(body.trips || []);
        setMessage("");
      })
      .catch(() => setMessage("Sign in to load your permanent trip history."))
      .finally(() => setLoading(false));
  }, []);

  const totalMiles = trips.reduce((sum, trip) => sum + Number(trip.miles || 0), 0);
  const totalIncome = trips.reduce((sum, trip) => sum + Number(trip.income || 0), 0);

  return (
    <CompanionShell game="GENERAL">
      <div className="companion-content">
        <div className="tool-page-hero">
          <div className="eyebrow">BC TRUCK WORKS / WORK</div>
          <h2>Trip History</h2>
          <p>Your permanent driver ledger for ATS and ETS2 miles, routes, cargo and earnings.</p>
        </div>

        <section className="tracker-kpis">
          <article className="kpi kpi-main"><span>TRIPS</span><strong>{trips.length}</strong><small>Saved driver records</small></article>
          <article className="kpi"><span>MILES</span><strong>{totalMiles.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong><small>Total tracked miles</small></article>
          <article className="kpi"><span>EARNINGS</span><strong>{"$" + Math.round(totalIncome).toLocaleString()}</strong><small>Total recorded income</small></article>
        </section>

        <section className="panel tracker-card">
          <div className="panel-header">
            <div><div className="eyebrow">DRIVER LEDGER</div><h3>Saved Trips</h3></div>
            <div className="tool-page-actions"><Link className="panel-button" href="/ats">Drive ATS</Link><Link className="panel-button secondary" href="/ets2">Drive ETS2</Link></div>
          </div>

          {loading ? <p className="muted history-empty">Loading...</p> :
            message ? <p className="muted history-empty">{message}</p> :
            trips.length === 0 ? <p className="muted history-empty">No permanent trips yet. Start a trip from the ATS or ETS2 tracker.</p> :
            <div className="history-table">
              {trips.map(trip => (
                <div className="history-row" key={trip.id}>
                  <div>
                    <strong>{trip.route_name || "Route not set"}</strong>
                    <small>{trip.game} • {trip.cargo || "No cargo"} • {trip.truck_name || "Truck"}</small>
                  </div>
                  <b>{Number(trip.miles || 0).toFixed(1)} mi</b>
                  <span>{trip.ended_at ? new Date(trip.ended_at).toLocaleDateString() : "Active"}</span>
                </div>
              ))}
            </div>}
        </section>
      </div>
    </CompanionShell>
  );
}
