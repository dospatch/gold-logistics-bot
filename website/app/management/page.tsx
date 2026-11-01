"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
type Application = { id: string; applicantId: string; applicant: string; games: string; truck: string; experience: string; availability: string; about: string; status: string; createdAt: string };
export default function ManagementPage() {
  const [user, setUser] = useState<{username:string;roles:string[]}|null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [me, queue] = await Promise.all([fetch("/api/me", {cache:"no-store"}), fetch("/api/applications", {cache:"no-store"})]);
      if (me.status === 401) { setUser(null); return; }
      const m = await me.json(); if (!me.ok) throw new Error(m.error || "Sign-in failed.");
      setUser(m.user);
      const q = await queue.json(); if (!queue.ok) throw new Error(q.error || "Could not load applications.");
      setApps(q.applications);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => apps.filter(a => filter === "All" || a.status === filter), [apps, filter]);
  async function decide(app: Application, decision: "approve"|"deny") {
    if (!window.confirm((decision === "approve" ? "Approve" : "Deny") + " " + app.applicant + "'s application?")) return;
    setBusy(app.id); setError(""); setNotice("");
    try {
      const r = await fetch("/api/applications/" + app.id + "/decision", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({decision})});
      const data = await r.json(); if (!r.ok) throw new Error(data.error || "Decision failed.");
      setNotice(data.status + " successfully recorded. " + (data.dmDelivered ? "Applicant was sent a Discord DM." : "Discord could not deliver the applicant DM."));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Decision failed."); }
    finally { setBusy(""); }
  }
  return <main className="management-shell">
    <header className="management-top"><a href="/" className="management-brand"><b>BC GOLD</b><span>LOGISTICS / MANAGEMENT</span></a><a href="/">← Public website</a></header>
    <section className="management-content">
      <div className="management-heading"><div><span className="section-kicker">PRIVATE COMPANY PORTAL</span><h1>Application <em>Review</em></h1><p>Recruitment queue for authorized BC Gold Logistics management.</p></div>{user && <div className="manager-profile"><b>{user.username}</b><small>{user.roles.filter(r=>["Owner","Chief Executive Officer","Operations Manager","Fleet Manager"].includes(r)).join(" · ")}</small><a href="/auth/logout">Sign out</a></div>}</div>
      {error && <div className="management-alert">{error}</div>}{notice && <div className="management-notice">{notice}</div>}
      {loading ? <div className="management-empty">Loading secure management portal…</div> : !user ? <div className="management-login"><div className="management-mark">BC</div><h2>Management access</h2><p>Sign in with your Discord account. Only Owner, CEO, Operations Manager, and Fleet Manager roles can access applications.</p><a className="btn gold" href="/auth/discord">Continue with Discord ↗</a></div> :
      <><div className="management-stats"><div><small>TOTAL APPLICATIONS</small><strong>{apps.length}</strong></div><div><small>PENDING REVIEW</small><strong>{apps.filter(a=>a.status==="Pending").length}</strong></div><div><small>APPROVED</small><strong>{apps.filter(a=>a.status==="Approved").length}</strong></div><div><small>DENIED</small><strong>{apps.filter(a=>a.status==="Denied").length}</strong></div></div>
      <div className="management-toolbar"><h2>Driver applications</h2><div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>Pending</option><option>Approved</option><option>Denied</option><option>All</option></select><button onClick={()=>void load()}>Refresh ↻</button></div></div>
      {visible.length===0 ? <div className="management-empty">No {filter.toLowerCase()} applications found.</div> : <div className="application-list">{visible.map(app=><article className="application-card" key={app.id}><div className="application-card-head"><div><span className={"status-pill "+app.status.toLowerCase()}>{app.status}</span><h3>{app.applicant}</h3><small>Submitted {new Date(app.createdAt).toLocaleString()}</small></div><span className="application-game">{app.games}</span></div><div className="application-details"><div><small>PREFERRED TRUCK</small><p>{app.truck}</p></div><div><small>AVAILABILITY</small><p>{app.availability}</p></div><div><small>EXPERIENCE</small><p>{app.experience}</p></div><div><small>WHY BC GOLD?</small><p>{app.about}</p></div></div><div className="screening"><b>Screening checklist</b><span>{app.games.trim() ? "✓ Game provided" : "• Game missing"}</span><span>{app.experience.trim() ? "✓ Experience provided" : "• Experience missing"}</span><span>{app.availability.trim() ? "✓ Availability provided" : "• Availability missing"}</span><span>{app.about.trim() ? "✓ Motivation provided" : "• Motivation missing"}</span><small>Screening prompts only — management makes the final decision.</small></div>{app.status==="Pending" && <div className="application-actions"><button disabled={busy===app.id} onClick={()=>void decide(app,"approve")}>Approve application</button><button className="deny" disabled={busy===app.id} onClick={()=>void decide(app,"deny")}>Deny application</button></div>}</article>)}</div>}</>}
    </section>
  </main>;
}
