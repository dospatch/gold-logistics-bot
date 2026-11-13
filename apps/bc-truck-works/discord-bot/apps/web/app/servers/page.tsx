import Link from "next/link";
import { Navigation } from "../components/Navigation";

const servers = [
  { name: "American Haulers", game: "American Truck Simulator", icon: "🇺🇸", status: "Online", players: "—", location: "United States", tag: "ATS" },
  { name: "Euro Freight Network", game: "Euro Truck Simulator 2", icon: "🇪🇺", status: "Online", players: "—", location: "Europe", tag: "ETS2" },
];

export default function ServersPage() {
  return (
    <>
      <Navigation />
      <main>
        <section className="section container server-hero">
          <div className="section-title">
            <div className="eyebrow">🌐 TruckWorks Server Network</div>
            <h1 style={{ fontSize: "clamp(42px, 6vw, 64px)" }}>Find your next <span>haul.</span></h1>
            <p>Explore servers connected to the BC TRUCK WORKS network. Server status, player data, and connection details will update automatically as dedicated servers come online.</p>
          </div>
          <div className="server-toolbar card">
            <div className="search-box">🔎 <input aria-label="Search servers" placeholder="Search servers..." /></div>
            <div className="filter-row">
              <button className="filter active">All servers</button><button className="filter">🇺🇸 ATS</button><button className="filter">🇪🇺 ETS2</button><button className="filter">🟢 Online</button>
            </div>
          </div>
        </section>
        <section className="section container servers-list-section">
          <div className="server-list-heading"><div><div className="eyebrow">Connected servers</div><h2>Server Network</h2></div><Link href="/dashboard/servers/add" className="btn primary">＋ Add your server</Link></div>
          <div className="server-grid">
            {servers.map((server) => (
              <article className="server-card card" key={server.name}>
                <div className="server-card-top"><div className="game-icon">{server.icon}</div><span className="status-badge">● {server.status}</span></div>
                <div className="server-card-title"><h3>{server.name}</h3><p>{server.game}</p></div>
                <div className="server-metrics"><div><small>PLAYERS</small><strong>{server.players}</strong></div><div><small>LOCATION</small><strong>{server.location}</strong></div><div><small>GAME</small><strong>{server.tag}</strong></div></div>
                <Link href="/login" className="server-action">View server details →</Link>
              </article>
            ))}
            <article className="server-card card add-server-card"><div className="add-icon">＋</div><h3>Connect your server</h3><p>Register a dedicated ATS or ETS2 server and connect it to your TruckWorks account.</p><Link href="/dashboard/servers/add" className="btn ghost">Register server</Link></article>
          </div>
        </section>
        <section className="section server-owner-section">
          <div className="container split-section">
            <div><div className="eyebrow">🛠️ Server owners</div><h2>Built to grow with your <span>fleet.</span></h2><p>TruckWorks is designed for communities running one server or an entire network. Register your servers, connect the agent, and manage everything from your customer dashboard.</p><div className="check-list"><div>✓ Dedicated server registration</div><div>✓ Agent connection monitoring</div><div>✓ Player and service status</div><div>✓ License-aware server management</div></div><Link href="/dashboard/servers/add" className="btn primary">Add a dedicated server</Link></div>
            <div className="card owner-panel"><div className="panel-topline"><span className="status-dot" /> CONNECTION READY</div><h3>TruckWorks Server Agent</h3><p>The customer server agent will securely connect your dedicated server to the platform and report its health to your dashboard.</p><div className="agent-status"><span>Agent</span><strong>Waiting for connection</strong></div><div className="agent-status"><span>License</span><strong>Account required</strong></div><div className="agent-status"><span>Network</span><strong>Ready</strong></div></div>
          </div>
        </section>
      </main>
      <footer className="footer"><div className="container footer-inner"><div><strong>BC TRUCK WORKS</strong><span>Server Network • ATS + ETS2</span></div><div className="footer-links"><Link href="/">Home</Link><Link href="/vtc">VTC</Link><Link href="/support">Support</Link></div></div></footer>
    </>
  );
}
