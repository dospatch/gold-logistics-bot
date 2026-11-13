import Link from "next/link";
import { DashboardShell } from "../../../components/DashboardShell";

export default function AddServerPage() {
  return (
    <DashboardShell title="Add Server">
      <div className="section-title">
        <div className="eyebrow">Server Management</div>
        <h2>Add a server</h2>
        <p>Register a dedicated TruckWorks server and prepare it for the BC TRUCK WORKS agent.</p>
      </div>

      <div className="card">
        <form className="form">
          <div className="field">
            <label htmlFor="name">Server name</label>
            <input id="name" name="name" placeholder="My Trucking Server" required />
          </div>

          <div className="field">
            <label htmlFor="game">Game</label>
            <select id="game" name="game" defaultValue="ats" required>
              <option value="ats">American Truck Simulator</option>
              <option value="ets2">Euro Truck Simulator 2</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="description">Server description</label>
            <textarea id="description" name="description" rows={4} placeholder="Tell us about this server..." />
          </div>

          <div className="card" style={{ marginTop: 8 }}>
            <div className="eyebrow">Next step</div>
            <h3>Connect your server agent</h3>
            <p>
              After registration, TruckWorks will provide the connection information needed to install and authenticate the server agent.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18 }}>
            <button className="btn primary" type="submit">Register server</button>
            <Link href="/dashboard/servers" className="btn">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
