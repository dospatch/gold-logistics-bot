import { DashboardShell } from "../../components/DashboardShell";

export default function SupportPage() {
  return <DashboardShell title="Support">
    <div className="section-title"><div className="eyebrow">Customer Care</div><h2>Support center</h2><p>Get help with servers, licenses, the agent, VTC tools, or your TruckWorks account.</p></div>
    <div className="grid two"><article className="card"><h3>Open a support request</h3><p>Support tickets will be tied to your account and server records so the right team has the necessary context.</p><button className="btn primary">Create ticket</button></article><article className="card"><h3>Knowledge base</h3><p>Installation, troubleshooting, server-agent, licensing, and platform documentation will be available here.</p><span className="badge">Coming soon</span></article></div>
  </DashboardShell>;
}
