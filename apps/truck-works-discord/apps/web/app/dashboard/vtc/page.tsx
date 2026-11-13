import { DashboardShell } from "../../components/DashboardShell";

export default function VtcPage() {
  return <DashboardShell title="VTC">
    <div className="section-title"><div className="eyebrow">Virtual Trucking Companies</div><h2>VTC management</h2><p>Build your VTC presence, fleet, members, events, and community operations inside TruckWorks.</p></div>
    <div className="grid three"><article className="card"><h3>Company profile</h3><p>Create and manage your VTC identity, description, branding, and contact links.</p></article><article className="card"><h3>Members & fleet</h3><p>Track drivers, vehicles, roles, and fleet activity as the VTC system expands.</p></article><article className="card"><h3>Events</h3><p>Plan convoys, routes, community events, and future attendance tracking.</p></article></div>
  </DashboardShell>;
}
