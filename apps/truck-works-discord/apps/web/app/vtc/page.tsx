import { Navigation } from "../components/Navigation";

export default function VtcPage() {
  return <><Navigation /><main className="section container"><div className="section-title"><div className="eyebrow">VTC Platform</div><h1 style={{ fontSize: 48 }}>Run your virtual trucking company from one place.</h1><p>Profiles, members, fleet tools, events, and community operations are planned as a first-class TruckWorks experience.</p></div><div className="grid three"><article className="card"><h3>Company profiles</h3><p>Present your VTC with a dedicated identity and public-facing information.</p></article><article className="card"><h3>Driver management</h3><p>Organize members, roles, fleets, and activity as your company grows.</p></article><article className="card"><h3>Convoys & events</h3><p>Build schedules and community events directly into the platform.</p></article></div></main></>;
}
