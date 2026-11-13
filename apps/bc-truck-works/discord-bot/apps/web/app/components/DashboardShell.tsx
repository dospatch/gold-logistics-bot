import Link from "next/link";

const links = [
  ["Dashboard", "/dashboard"],
  ["Live Telemetry", "/dashboard/telemetry"],
  ["Servers", "/dashboard/servers"],
  ["Licenses", "/dashboard/licenses"],
  ["Downloads", "/dashboard/downloads"],
  ["VTC", "/dashboard/vtc"],
  ["Support", "/dashboard/support"],
];

export function DashboardShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <Link href="/" className="brand">BC <span>TRUCK WORKS</span></Link>
        <nav className="sidebar-nav">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div style={{ marginTop: 28 }} className="kicker">Customer Platform</div>
      </aside>
      <section className="main">
        <header className="main-header">
          <div><strong>{title}</strong><div className="kicker">Manage your TruckWorks services</div></div>
          <Link href="/" className="btn ghost">Public site</Link>
        </header>
        <main className="main-content">{children}</main>
      </section>
    </div>
  );
}
