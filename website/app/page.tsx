import Link from "next/link";

const pillars = [
  { number: "01", title: "Professional Operations", body: "Clear expectations, reliable communication, and a consistent standard for every driver." },
  { number: "02", title: "Convoys & Community", body: "Bring the miles to life with organized group drives and a welcoming trucking community." },
  { number: "03", title: "Room to Grow", body: "Whether you are new to virtual trucking or an experienced driver, your journey can start here." },
];
const standards = [
  ["Respect the road", "Drive responsibly and respect other players and road users."],
  ["Support the team", "Communicate clearly and help create a positive company environment."],
  ["Bring your best", "Represent BC Gold Logistics with professionalism on every journey."],
];

export default function Home() {
  return <main className="home-redesign">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="topline"><span className="topline-dot"/> VIRTUAL TRUCKING COMPANY <span className="topline-sep">/</span> AMERICAN TRUCK SIMULATOR <span className="topline-sep">/</span> EURO TRUCK SIMULATOR 2</div>
    <header className="main-nav"><div className="nav-inner"><Link href="/" className="nav-brand"><img src="/bc-gold-logistics-logo.svg" alt="BC Gold Logistics" /><span><b>BC GOLD LOGISTICS</b><small>DRIVEN BY EXCELLENCE</small></span></Link><nav aria-label="Main navigation"><a href="#company">Company</a><a href="#operations">Operations</a><a href="#standard">Our Standard</a><Link href="/careers">Careers</Link><Link href="/convoys">Convoys</Link><Link href="/driver">Driver Portal</Link></nav><details className="mobile-menu"><summary aria-label="Open navigation menu">MENU <span aria-hidden="true">☰</span></summary><div className="mobile-menu-panel"><a href="#company">Company</a><a href="#operations">Operations</a><a href="#standard">Our Standard</a><Link href="/about">About</Link><Link href="/careers">Careers</Link><Link href="/standards">Standards</Link><Link href="/management">Management</Link><Link href="/convoys">Convoys & Events</Link><Link href="/driver">Driver Portal</Link></div></details><Link className="nav-apply" href="/careers">JOIN THE COMPANY <span>↗</span></Link></div></header>
    <section className="new-hero" id="main-content">
      <div className="new-hero-photo"/>
      <div className="new-hero-shade"/>
      <div className="new-hero-inner">
        <div className="hero-copy"><div className="new-kicker"><i/> THE ROAD AHEAD STARTS HERE</div><h1>Driven by<br/><em>Excellence.</em></h1><h2>United by the Road.</h2><p>Every mile tells a story. Build yours with a virtual trucking company focused on professionalism, community, and the pride of the journey.</p><div className="new-hero-buttons"><Link href="/careers" className="gold-button">BECOME A DRIVER <span>→</span></Link><a href="#company" className="dark-button">DISCOVER BC GOLD</a></div><div className="hero-facts"><span>ATS + ETS2</span><b/> <span>COMMUNITY FIRST</span><b/> <span>ONE TEAM · ONE ROAD</span></div></div>
        <div className="hero-emblem"><img src="/bc-gold-logistics-logo.svg" alt="BC Gold Logistics gold truck emblem" /><div className="emblem-caption">BUILT FOR THE LONG HAUL</div></div>
      </div>
      <div className="hero-bottom-label"><span>01</span> / THE BC GOLD EXPERIENCE <span className="hero-bottom-rule"/></div>
    </section>
    <div className="gold-ribbon"><div>PRECISION <b>✦</b> PROFESSIONALISM <b>✦</b> COMMUNITY <b>✦</b> COMMITMENT <b>✦</b> PRECISION <b>✦</b> PROFESSIONALISM</div></div>
    <section className="new-intro" id="company"><div className="new-section-label">02 <span>/</span> WHO WE ARE</div><div className="new-intro-grid"><div><h2>More than miles.<br/><em>We're a team.</em></h2></div><div className="intro-description"><div className="intro-gold-line"/><p className="intro-lead">The best journeys are built together.</p><p>BC Gold Logistics brings drivers together through American Truck Simulator and Euro Truck Simulator 2. We are building a dependable, respectful, and enjoyable VTC experience where every driver has a place and every mile means something.</p><Link href="/about" className="under-link">GET TO KNOW THE COMPANY <span>↗</span></Link></div></div></section>
    <section className="new-operations" id="operations"><div className="new-section-label">03 <span>/</span> THE WAY WE ROLL</div><div className="operations-heading"><h2>Built around<br/><em>the journey.</em></h2><p>Good people. Shared goals. A company culture that keeps moving forward.</p></div><div className="pillar-grid">{pillars.map(p=><article className="pillar" key={p.number}><div className="pillar-top"><span>{p.number}</span><i>✦</i></div><h3>{p.title}</h3><p>{p.body}</p><div className="pillar-bottom"/></article>)}</div></section>
    <section className="new-standard" id="standard"><div className="standard-photo"/><div className="standard-panel"><div className="new-section-label">04 <span>/</span> THE BC GOLD STANDARD</div><h2>One road.<br/><em>One standard.</em></h2><p className="standard-intro">Our reputation is built one journey at a time. These are the values we bring to every trip and every interaction.</p><div className="standard-list">{standards.map((s,i)=><div className="standard-row" key={s[0]}><span>0{i+1}</span><div><h3>{s[0]}</h3><p>{s[1]}</p></div></div>)}</div><Link href="/standards" className="under-link">READ OUR COMPANY STANDARDS <span>↗</span></Link></div></section>
    <section className="join-band"><div className="join-watermark">BC</div><div className="join-inner"><div><div className="new-section-label">05 <span>/</span> YOUR NEXT CHAPTER</div><h2>Your next mile<br/>starts <em>with us.</em></h2><p>Ready to roll with a team that values the journey as much as the destination?</p></div><div className="join-action"><Link href="/careers" className="gold-button">EXPLORE DRIVER CAREERS <span>→</span></Link><small>Start your application online. Your journey begins here.</small></div></div></section>
    <footer className="new-footer"><div className="footer-main"><Link href="/" className="footer-brand"><img src="/bc-gold-logistics-logo.svg" alt="BC Gold Logistics" /><span><b>BC GOLD LOGISTICS</b><small>DRIVEN BY EXCELLENCE. UNITED BY THE ROAD.</small></span></Link><div className="footer-nav"><Link href="/about">ABOUT</Link><Link href="/careers">CAREERS</Link><Link href="/standards">STANDARDS</Link><Link href="/management">MANAGEMENT</Link><Link href="/convoys">CONVOYS</Link><Link href="/driver">DRIVER PORTAL</Link></div></div><div className="footer-legal"><span>© {new Date().getFullYear()} BC Gold Logistics. All rights reserved.</span><span>VIRTUAL TRUCKING COMPANY · ATS / ETS2</span></div></footer>
  </main>;
}
