import { DashboardShell } from "../../components/DashboardShell";

export default function DownloadsPage() {
  return <DashboardShell title="Downloads">
    <div className="section-title"><div className="eyebrow">Resources</div><h2>Downloads</h2><p>Access platform agents, supported server resources, and future TruckWorks releases.</p></div>
    <div className="grid two"><article className="card"><h3>Server Agent</h3><p>The customer server agent will connect your dedicated server to the TruckWorks API.</p><span className="badge warning">Coming next</span></article><article className="card"><h3>Platform resources</h3><p>Documentation, installation guides, release notes, and supported integrations will live here.</p><span className="badge">Planned</span></article></div>
  </DashboardShell>;
}
