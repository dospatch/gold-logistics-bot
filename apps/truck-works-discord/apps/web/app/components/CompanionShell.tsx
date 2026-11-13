"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/ats" || href === "/ets2" || href === "/convoy" || href === "/vtc" || href === "/support") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const groups = [
  { title: "DRIVE", items: [["▶","Drive","/ats"],["◈","ETS2","/ets2"],["🎙","Co-Driver","/companion/codriver"],["➤","Navigation","/companion/navigation"],["▣","Truck Health","/dashboard/telemetry"],["⇅","Shift Coach","/companion/shift-coach"]] },
  { title: "WORK", items: [["⛟","Dispatch & BOL","/companion/dispatch"],["▤","Trip History","/companion/trips"],["▥","Earnings & Stats","/companion/earnings"],["📷","Driver Journal","/companion/journal"],["🏢","Company / VTC","/vtc"],["★","Career","/companion/career"]] },
  { title: "CONVOY", items: [["◉","Convoy Hub","/convoy"],["◎","Convoy","/companion/convoy"],["🏆","Leaderboard","/companion/leaderboard"],["⌖","Convoy Radar","/companion/radar"],["⚑","Sessions","/companion/sessions"],["✔","Pre-Flight","/companion/preflight"],["✦","Intelligence","/companion/intelligence"],["⌘","Command Center","/companion/command"]] },
  { title: "STREAM", items: [["🎥","Stream Studio","/companion/stream"],["🎚","Mixer & OBS","/companion/mixer"]] },
  { title: "SETUP", items: [["⚠","Alerts & Discord","/companion/alerts"],["▦","Dashboard Studio","/companion/studio"],["◆","Mods","/dashboard/downloads"],["⚙","Settings","/companion/settings"],["💡","Suggestions","/support"]] }
] as const;

export function CompanionShell({ children, game }: { children: React.ReactNode; game: "ATS" | "ETS2" | "GENERAL" }) {
  const pathname = usePathname();
  return <div className="companion">
    <aside className="companion-sidebar">
      <Link href="/" className="companion-brand"><img className="companion-brand-logo" src="/bc-truck-works-logo.webp" alt="BC TRUCK WORKS logo" /><div><strong>BC TRUCK WORKS</strong><small>ATS / ETS2 COMPANION</small></div></Link>
      <div className="version">LIVE COMPANION v2.1.0</div>
      <nav className="companion-nav">
        {groups.map(group => <div className="nav-section" key={group.title}><div className="nav-heading">{group.title}</div>{group.items.map(([icon,label,href]) => <Link key={href} href={href} className={"companion-link "+(isActive(pathname, href)?"active":"")}><span>{icon}</span>{label}</Link>)}</div>)}
      </nav>
      <div className="sidebar-game"><div className="mini-label">SIMULATORS</div><strong>🇺🇸 ATS</strong><strong>🇪🇺 ETS2</strong><span className="live-dot">● READY FOR TELEMETRY</span></div>
    </aside>
    <main className="companion-main"><header className="companion-header"><div><div className="crumb">BC TRUCK WORKS / {game}</div><h1>{game === "ATS" ? "American Truck Simulator" : game === "ETS2" ? "Euro Truck Simulator 2" : "Companion Control Center"}</h1></div><div className="connection live">● Companion ONLINE</div></header>{children}</main>
  </div>;
}
