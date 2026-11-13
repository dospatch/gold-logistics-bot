import Link from "next/link";
import { DashboardShell } from "../../components/DashboardShell";

export default function ServersPage() {
  return <DashboardShell title="Servers">
    <div className="section-title"><div className="eyebrow">Infrastructure</div><h2>Your servers</h2><p>Manage dedicated TruckWorks-connected servers from one account.</p></div>
    <div className="card"><div className="list"><div className="list-row"><div><strong>No servers registered</strong><small>Register a server to receive its platform connection identity.</small></div><span className="badge warning">Offline</span></div></div><div style={{ marginTop: 18 }}><Link href="/dashboard/servers/add" className="btn primary">Register server</Link></div></div>
    <div className="section"><div className="grid three"><article className="card"><h3>Heartbeat</h3><p>Agents will report health, version, and connection state to the API.</p></article><article className="card"><h3>Players</h3><p>Supported server agents can publish current player information here.</p></article><article className="card"><h3>Licensing</h3><p>Each managed server can be associated with a platform license.</p></article></div></div>
  </DashboardShell>;
}
