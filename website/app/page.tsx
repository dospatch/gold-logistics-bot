import Link from "next/link";

const facts = [
  ["ATS", "American Truck Simulator home base"],
  ["VTC", "A community trucking company"],
  ["OPEN", "Driver applications reviewed by management"],
  ["CONVOYS", "Optional organized multiplayer drives"],
];
const divisions = [
  ["Company Drivers", "Join the roster, represent BC Gold Logistics, and take part in company driving activities."],
  ["Dispatch & Operations", "Coordinate routes, freight runs, driver assignments, and company events."],
  ["Fleet Management", "Maintain company truck and trailer records, preferred equipment, and fleet standards."],
  ["Driver Community", "Meet other ATS players, share routes, and take part in organized Convoy sessions."],
];

export default function Home() {
  return <main className="subpage">
    <div className="section-kicker">AMERICAN TRUCK SIMULATOR · VIRTUAL TRUCKING COMPANY</div>
    <h1>BC Gold <em>Logistics</em></h1>
    <p>More than a tag on a truck. BC Gold Logistics is a player-run ATS trucking company built for drivers who want to run their own routes, join a team, and take part in organized company convoys.</p>
    <div className="value-grid">{facts.map(([value,label])=><article key={label}><span>{value}</span><h3>{label}</h3></article>)}</div>
    <h2>Drive your way. Run as a team.</h2>
    <p>Enjoy American Truck Simulator on your own, then connect with the company for shared deliveries, scheduled Convoy sessions, and community events. Multiplayer participation uses the game's Convoy mode; TruckersMP is not required.</p>
    <div className="value-grid">{divisions.map(([title,body])=><article key={title}><span>BC GOLD LOGISTICS</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    <div className="career-box">
      <h2>Ready to join the fleet?</h2>
      <p>Applications are open to ATS players. Sign in with Discord, tell us a little about your driving experience and availability, and company management will review your application. Approval is required before joining the official driver roster.</p>
      <Link className="btn gold" href="/apply">Apply to become a driver ↗</Link>
    </div>
    <h2>Company resources</h2>
    <p><Link className="back" href="/convoys">Convoys & events →</Link>　<Link className="back" href="/standards">Driver standards →</Link>　<Link className="back" href="/driver">Driver portal →</Link></p>
  </main>;
}
