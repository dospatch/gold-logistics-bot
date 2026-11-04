import Link from "next/link";

const facts = [
  ["300+", "Company fleet capacity"],
  ["600+", "Employee planning capacity"],
  ["24/7", "Distribution center operations"],
  ["B2B", "Wholesale customers only"],
];
const divisions = [
  ["Transportation & Fleet", "Company-operated regional trucking, dispatch, fleet planning, inspections, and maintenance."],
  ["Wholesale Distribution", "Round-the-clock receiving, storage, order staging, cross-docking, and outbound shipping."],
  ["Carrier & Customer Services", "Wholesale account coordination, carrier registration, appointments, shipment visibility, and claims."],
  ["People & Compliance", "Recruitment, onboarding, training, safety, compliance, payroll, and employee services."],
];
export default function Home() {
  return <main className="subpage">
    <div className="section-kicker">REGIONAL TRANSPORTATION & DISTRIBUTION</div>
    <h1>BC Logistics <em>LLC</em></h1>
    <p>Built to move wholesale freight. BC Logistics LLC is planned as an integrated regional transportation and distribution company, combining a company-operated fleet, 24/7 warehouse operations, and coordinated wholesale freight services.</p>
    <div className="value-grid">{facts.map(([value,label])=><article key={label}><span>{value}</span><h3>{label}</h3></article>)}</div>
    <h2>One company. Connected operations.</h2>
    <p>Our operating model brings transportation, dispatch, warehouse operations, fleet maintenance, carrier services, safety, and corporate support together on one coordinated campus.</p>
    <div className="value-grid">{divisions.map(([title,body])=><article key={title}><span>BC LOGISTICS</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    <div className="career-box"><h2>Wholesale business focus</h2><p>BC Logistics LLC is planned to serve wholesale and business customers. The company is not positioned as a direct-to-consumer retail delivery service. Approved outside carriers may register as freight partners under separate carrier procedures.</p><Link className="btn gold" href="/operations">Explore our operations ↗</Link></div>
    <h2>Build the company with us</h2>
    <p>Explore the company, operating divisions, and career opportunities as the organization develops.</p>
    <p><Link className="back" href="/about">About BC Logistics LLC →</Link>　<Link className="back" href="/careers">Careers →</Link></p>
  </main>;
}
