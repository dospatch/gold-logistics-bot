import Link from "next/link";
import { Navigation } from "../components/Navigation";

export default function SupportPage() {
  return <><Navigation /><main className="section container"><div className="section-title"><div className="eyebrow">Support</div><h1 style={{ fontSize: 48 }}>Help for your TruckWorks setup.</h1><p>Get guidance for account access, server agents, licensing, VTC tools, and platform services.</p></div><div className="grid two"><article className="card"><h3>Customer support</h3><p>Sign in to create and track a support request associated with your account and server.</p><Link href="/login" className="btn primary">Sign in</Link></article><article className="card"><h3>Documentation</h3><p>Installation guides and technical documentation will be added as the API and agent reach production.</p><span className="badge">In development</span></article></div></main></>;
}
