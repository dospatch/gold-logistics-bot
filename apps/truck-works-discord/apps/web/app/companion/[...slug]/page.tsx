import Link from "next/link";
import { CompanionShell } from "../../components/CompanionShell";

const titles: Record<string, string> = {
  codriver: "Co-Driver",
  navigation: "Navigation",
  dispatch: "Dispatch & BOL",
  trips: "Trip History",
  earnings: "Earnings & Stats",
  journal: "Driver Journal",
  career: "Career",
  convoy: "Convoy",
  leaderboard: "Leaderboard",
  radar: "Convoy Radar",
  sessions: "Convoy Sessions",
  preflight: "Convoy Pre-Flight",
  intelligence: "Convoy Intelligence",
  command: "Command Center",
  stream: "Stream Studio",
  mixer: "Mixer & OBS",
  alerts: "Alerts & Discord",
  studio: "Dashboard Studio",
  settings: "Companion Settings",
  "shift-coach": "Shift Coach",
};

export default async function CompanionToolPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const title = titles[slug.join("/")] ?? "Companion System";

  return (
    <CompanionShell game="GENERAL">
      <div className="companion-content">
        <div className="tool-page-hero">
          <div className="eyebrow">BC TRUCK WORKS / COMPANION</div>
          <h2>{title}</h2>
          <p>This module is part of the BC TRUCK WORKS ATS + ETS2 control center.</p>
        </div>

        <section className="panel">
          <div className="eyebrow">SYSTEM STATUS</div>
          <h3>{title} is ready</h3>
          <p className="muted">
            The companion shell, live telemetry connection, simulator switching, and
            driver dashboard are online. This module is prepared for its dedicated
            controls and data.
          </p>
          <div className="tool-page-actions">
            <Link className="panel-button" href="/ats">ATS Dashboard</Link>
            <Link className="panel-button secondary" href="/ets2">ETS2 Dashboard</Link>
            <Link className="panel-button secondary" href="/dashboard/telemetry">Telemetry</Link>
          </div>
        </section>
      </div>
    </CompanionShell>
  );
}
