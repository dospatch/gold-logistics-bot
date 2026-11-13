import Link from "next/link";
import { CompanionShell } from "../components/CompanionShell";

export default function ConvoyPage() {
  return (
    <CompanionShell game="GENERAL">
      <div className="companion-content">
        <div className="tool-page-hero">
          <div className="eyebrow">BC TRUCK WORKS / CONVOY</div>
          <h2>Convoy Hub</h2>
          <p>Plan, launch and monitor multiplayer trucking sessions across ATS and ETS2.</p>
        </div>

        <section className="panel">
          <h3>Convoy Control Center</h3>
          <div className="tool-grid">
            <Link className="tool-card" href="/companion/sessions">
              <span>⚑</span>
              <div><strong>Sessions</strong><small>Manage convoy sessions</small></div>
            </Link>
            <Link className="tool-card" href="/companion/preflight">
              <span>✔</span>
              <div><strong>Pre-Flight</strong><small>Check drivers and telemetry</small></div>
            </Link>
            <Link className="tool-card" href="/companion/radar">
              <span>⌖</span>
              <div><strong>Radar</strong><small>Track convoy activity</small></div>
            </Link>
          </div>
        </section>
      </div>
    </CompanionShell>
  );
}
