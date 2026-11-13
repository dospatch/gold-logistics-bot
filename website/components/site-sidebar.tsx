"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const groups = [
  { label: "COMPANY", links: [
    { href: "/", title: "Company Home", icon: "⌂" },
    { href: "/about", title: "About Us", icon: "◈" },
    { href: "/careers", title: "Careers", icon: "✦" },
    { href: "/standards", title: "Driver Standards", icon: "✓" },
  ]},
  { label: "DRIVER RESOURCES", links: [
    { href: "/apply", title: "Apply to Join", icon: "＋" },
    { href: "/driver", title: "Driver Portal", icon: "▣" },
    { href: "/convoys", title: "Convoys & Events", icon: "⇢" },
  ]},
  { label: "OPERATIONS", links: [
    { href: "/operations", title: "Operations", icon: "▤" },
    { href: "/management", title: "Management", icon: "⚙" },
  ]},
];

export default function SiteSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <>
    <button className="sidebar-mobile-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? "×" : <><img src="/bc-gold-logistics-logo.svg" alt="" /><span>MENU</span></>}</button>
    {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={"company-sidebar " + (open ? "is-open" : "")}>
      <Link href="/" className="sidebar-brand" onClick={() => setOpen(false)}>
        <img
          src="/bc-gold-logistics-logo.svg"
          alt="BC Gold Logistics company logo"
          width={64}
          height={64}
          style={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0, padding: 3, border: "1px solid #d7b34a", borderRadius: 8, background: "#050505", boxShadow: "0 0 16px #d7b34a22" }}
        />
        <span><b>BC GOLD</b><small>LOGISTICS</small></span>
      </Link>
      <div className="sidebar-status"><i /> COMPANY NETWORK <span>ATS · VTC</span></div>
      <nav aria-label="Company navigation">
        {groups.map(group => <section className="sidebar-group" key={group.label}><h2>{group.label}</h2>{group.links.map(link => {
          const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(link.href + "/");
          return <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={active ? "sidebar-link active" : "sidebar-link"} aria-current={active ? "page" : undefined}><span className="sidebar-icon">{link.icon}</span><span>{link.title}</span>{active && <i className="sidebar-active-mark" />}</Link>;
        })}</section>)}
      </nav>
      <div className="sidebar-bottom"><a href="https://discord.gg/uPvQNgHCr" target="_blank" rel="noopener noreferrer" style={{ color: "#e4c15b", fontSize: 10, letterSpacing: 1.3, fontWeight: 800 }}>JOIN OUR DISCORD ↗</a><span>DRIVE WITH PURPOSE</span><small>BC GOLD LOGISTICS © {new Date().getFullYear()}</small></div>
    </aside>
  </>;
}
