import Link from "next/link";
import { CompanionShell } from "../../components/CompanionShell";

export default function Page() {
  return (
    <CompanionShell game="GENERAL">
      <div className="companion-content">
        <div className="tool-page-hero">
          <div className="eyebrow">BC TRUCK WORKS / COMPANION</div>
          <h2>Career</h2>
          <p>
            Track your trucking career, progress, and simulator activity from the
            BC TRUCK WORKS live companion.
          </p>
        </div>

        <section className="panel">
          <div className="eyebrow">SYSTEM READY</div>
          <h3>Career</h3>
          <p className="muted">
            Career tools are connected to the BC TRUCK WORKS companion and ready
            for live ATS and ETS2 data.
          </p>

          <div className="tool-page-actions">
            <Link className="panel-button" href="/ats">
              ATS
            </Link>
            <Link className="panel-button secondary" href="/ets2">
              ETS2
            </Link>
            <Link className="panel-button secondary" href="/dashboard/telemetry">
              Telemetry
            </Link>
          </div>
        </section>
      </div>
    </CompanionShell>
  );
}
