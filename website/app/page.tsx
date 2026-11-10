import Link from "next/link";

const operations = [
  { number: "01", title: "Company Driving", text: "Drive with approved BC Gold Logistics members through organized ATS Convoy sessions. Company operations are built around coordinated multiplayer driving." },
  { number: "02", title: "Dispatch & Freight", text: "Company freight activity is organized around routes, cargo, driver assignments, and delivery records. Approved drivers can view their assignments in the driver portal." },
  { number: "03", title: "Fleet Operations", text: "Company equipment is tracked as a managed fleet, with truck and trailer assignments maintained for operational planning as the fleet grows." },
];

const principles = [
  ["Professionalism", "Represent the company respectfully in-game, on Discord, and during company activities."],
  ["Teamwork", "Company driving is organized around multiplayer Convoy operations, clear communication, and coordinated routes."],
  ["Progress", "Build experience through consistent driving, reliable communication, and recorded deliveries."],
];

const discordInvite = "https://discord.gg/uPvQNgHCr";

export default function Home() {
  return <main>
    <div className="announcement"><span className="live-dot" /> AMERICAN TRUCK SIMULATOR <i /> MULTIPLAYER VTC <i /> ORGANIZED COMPANY CONVOYS</div>
    <header className="wrap nav">
      <Link href="/" className="brand"><img src="/bc-gold-logistics-logo.svg" alt="BC Gold Logistics" style={{ width: 54, height: 54, objectFit: "contain" }} /><span><b>BC GOLD LOGISTICS</b><small>DRIVE WITH PURPOSE</small></span></Link>
      <nav aria-label="Main navigation">
        <a href="#company">COMPANY</a><a href="#operations">OPERATIONS</a><a href="#standards">OUR STANDARD</a>
        <Link href="/convoys">CONVOYS</Link><Link href="/driver">DRIVER PORTAL</Link>
        <a href={discordInvite} target="_blank" rel="noopener noreferrer">DISCORD ↗</a>
      </nav>
      <Link className="nav-cta" href="/apply">JOIN THE FLEET <span>↗</span></Link>
    </header>

    <section className="hero">
      <div className="hero-grid" />
      <div className="wrap hero-content">
        <div className="eyebrow"><span /> BUILT FOR THE LONG HAUL</div>
        <h1>Every mile has<br />a <em>purpose.</em></h1>
        <p>BC Gold Logistics is a multiplayer American Truck Simulator virtual trucking company built around coordinated company convoys, professional drivers, and organized freight operations.</p>
        <div className="hero-actions"><Link className="btn gold" href="/apply">APPLY TO THE COMPANY <span>↗</span></Link><Link className="btn outline" href="/convoys">EXPLORE CONVOYS</Link></div>
        <img src="/bc-gold-logistics-logo.svg" alt="BC Gold Logistics gold truck emblem" style={{ display: "block", width: "min(180px, 34vw)", height: "auto", marginTop: 28, border: "1px solid #d7b34a88", borderRadius: 10, padding: 8, background: "#08090bcc" }} />
        <div className="hero-meta"><span>AMERICAN TRUCK SIMULATOR</span><b /> <span>MULTIPLAYER VTC</span><b /> <span>DRIVER APPLICATIONS OPEN</span></div>
      </div>
    </section>

    <div className="ticker">INDEPENDENT DRIVERS <b>✦</b> SHARED MILES <b>✦</b> PROFESSIONAL OPERATIONS <b>✦</b> ONE COMPANY</div>

    <section className="section wrap" id="company">
      <div className="intro-grid">
        <div><div className="section-kicker">WHO WE ARE</div><h2>One company.<br/><em>Many roads.</em></h2></div>
        <div><p className="lead">A coordinated company experience on the virtual road.</p><p className="muted">BC Gold Logistics is organized for drivers who want to operate together in ATS multiplayer Convoy sessions. Members represent one company, follow shared operating standards, and participate in coordinated freight runs and company events.</p><Link className="text-link" href="/standards">READ OUR DRIVER STANDARDS <span>↗</span></Link></div>
      </div>
    </section>

    <section className="section services" id="operations">
      <div className="wrap">
        <div className="section-head"><div><div className="section-kicker">HOW WE OPERATE</div><h2>Built around the<br/><em>work that moves us.</em></h2></div><p>From dispatch coordination to completed company runs, every driver contributes to one connected operation.</p></div>
        <div className="service-grid">{operations.map(item=><article className="service-card" key={item.number}><span>OPERATION {item.number}</span><div className="service-icon">✦</div><h3>{item.title}</h3><p>{item.text}</p><div className="card-line" /></article>)}</div>
      </div>
    </section>

    <section className="fleet">
      <div className="fleet-image" role="img" aria-label="A highway freight truck on the open road" />
      <div className="fleet-copy"><div className="section-kicker">THE BC GOLD FLEET</div><h2>Equipment with<br/><em>a purpose.</em></h2><p>We treat fleet operations as a company responsibility. Trucks, trailers, and driver assignments are organized to support dependable freight activity and future growth. Our fleet records will expand as company equipment is added.</p><Link className="text-link" href="/driver">OPEN THE DRIVER PORTAL <span>↗</span></Link></div>
    </section>

    <section className="section wrap values" id="standards">
      <div className="section-kicker">WHAT DRIVERS CAN EXPECT</div><h2>Good miles start<br/>with <em>good standards.</em></h2>
      <div className="value-grid">{principles.map(([title,body])=><article key={title}><span>BC GOLD PRINCIPLE</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      <Link className="text-link" href="/standards">VIEW COMPANY STANDARDS <span>↗</span></Link>
    </section>

    <section className="careers">
      <div className="wrap career-inner"><div><div className="section-kicker">RECRUITMENT · DRIVER APPLICATIONS</div><h2>Your next route<br/>could start <em>here.</em></h2><p>Interested in joining BC Gold Logistics? Submit your application through the website. Management reviews applications, and approved drivers receive access to company driver resources.</p></div><div className="career-action"><Link className="btn gold" href="/apply">START YOUR APPLICATION <span>↗</span></Link><a href={discordInvite} target="_blank" rel="noopener noreferrer" className="text-link">JOIN OUR DISCORD <span>↗</span></a><small>Discord sign-in required · Management approval required</small></div></div>
    </section>

    <footer className="footer"><div className="wrap footer-top"><Link href="/" className="brand"><img src="/bc-gold-logistics-logo.svg" alt="BC Gold Logistics" style={{ width: 54, height: 54, objectFit: "contain" }} /><span><b>BC GOLD LOGISTICS</b><small>DRIVE WITH PURPOSE</small></span></Link><p>American Truck Simulator · Virtual Trucking Company</p><div className="footer-links"><Link href="/apply">Apply</Link><Link href="/convoys">Convoys</Link><Link href="/standards">Standards</Link><Link href="/driver">Driver Portal</Link><a href={discordInvite} target="_blank" rel="noopener noreferrer">Discord ↗</a></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} BC GOLD LOGISTICS</span><span>REAL DRIVERS. REAL DELIVERIES. ONE TEAM.</span></div></footer>
  </main>;
}
