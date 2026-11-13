import { DashboardShell } from "../../components/DashboardShell";

export default function LicensesPage() {
  return <DashboardShell title="Licenses">
    <div className="section-title"><div className="eyebrow">Licensing</div><h2>License management</h2><p>View plans, activation status, expiration, and server assignments.</p></div>
    <div className="card"><div className="list"><div className="list-row"><div><strong>No active licenses</strong><small>Your license inventory will appear here after activation.</small></div><span className="badge warning">Unlicensed</span></div></div></div>
  </DashboardShell>;
}
