"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanionShell } from "../../components/CompanionShell";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Stats = {
  trip_count: number;
  miles: number;
  income: number;
  ats_miles: number;
  ets2_miles: number;
  completed_trips: number;
};

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [message, setMessage] = useState("Loading driver statistics...");

  useEffect(() => {
    fetch(API_URL + "/api/trips/stats", { credentials: "include", cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Authentication required");
        const body = await response.json();
        setStats(body.stats);
        setMessage("");
      })
      .catch(() => setMessage("Sign in to load permanent driver statistics."));
  }, []);

  return (
    <CompanionShell game="GENERAL">
      <div className="companion-content">
        <div className="tool-page-hero">
          <div className="eyebrow">BC TRUCK WORKS / WORK</div>
          <h2>Earnings & Stats</h2>
          <p>Permanent mileage and earnings totals across your ATS and ETS2 driving history.</p>
        </div>

        {!stats ? <section className="panel"><p className="muted">{message}</p></section> :
          <>
            <section className="tracker-kpis">
              <article className="kpi kpi-main"><span>TOTAL MILES</span><strong>{Number(stats.miles).toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong><small>ATS + ETS2</small></article>
              <article className="kpi"><span>TRIPS</span><strong>{stats.trip_count}</strong><small>{stats.completed_trips} completed</small></article>
              <article className="kpi"><span>EARNINGS</span><strong>{"$" + Math.round(Number(stats.income)).toLocaleString()}</strong><small>Recorded income</small></article>
            </section>
            <section className="panel tracker-card">
              <div className="eyebrow">GAME BREAKDOWN</div>
              <div className="performance-grid">
                <div><span>ATS MILES</span><strong>{Number(stats.ats_miles).toFixed(1)} mi</strong></div>
                <div><span>ETS2 MILES</span><strong>{Number(stats.ets2_miles).toFixed(1)} mi</strong></div>
                <div><span>COMPLETED TRIPS</span><strong>{stats.completed_trips}</strong></div>
                <div><span>AVERAGE / TRIP</span><strong>{stats.trip_count ? (Number(stats.miles) / stats.trip_count).toFixed(1) : "0.0"} mi</strong></div>
              </div>
            </section>
          </>
        }

        <div className="tool-page-actions"><Link className="panel-button" href="/companion/trips">Trip History</Link><Link className="panel-button secondary" href="/ats">Drive ATS</Link><Link className="panel-button secondary" href="/ets2">Drive ETS2</Link></div>
      </div>
    </CompanionShell>
  );
}
