import type { Metadata } from "next";
import "./careers-v2.css";

export const metadata: Metadata = {
  title: "Careers & Recruitment",
  description: "Explore career paths, recruitment information, and employment applications at BC Logistics LLC.",
};

const departments = [
  ["01", "Transportation & professional drivers", "Company fleet operations, route execution, and delivery performance."],
  ["02", "Dispatch & load planning", "Shipment coordination, scheduling, load planning, and driver support."],
  ["03", "Warehouse & distribution", "Inventory handling, receiving, order preparation, and distribution operations."],
  ["04", "Fleet maintenance & technicians", "Preventive maintenance, inspections, repairs, and equipment readiness."],
  ["05", "Safety, compliance & security", "Operational safety, policy compliance, risk awareness, and facility security."],
  ["06", "Human resources & employee services", "Recruitment, onboarding, employee support, and workforce administration."],
  ["07", "Finance, procurement & administration", "Financial administration, purchasing, records, and business support."],
  ["08", "IT, systems & facilities", "Technology support, business systems, infrastructure, and facilities."],
];

const resources = [
  { href: "/careers/departments", number: "01", title: "Explore departments", text: "Understand the teams in the long-term company plan." },
  { href: "/careers/process", number: "02", title: "Recruitment process", text: "See the proposed stages from submission through onboarding." },
  { href: "/careers/working-here", number: "03", title: "Working at BC Logistics", text: "Review the professional standards and culture we aim to build." },
  { href: "/careers/onboarding", number: "04", title: "Training & onboarding", text: "Learn how approved roles will be introduced and supported." },
  { href: "/careers/faq", number: "05", title: "Recruitment FAQ", text: "Get answers about applications, qualifications, and updates." },
  { href: "/careers/carriers", number: "06", title: "Carrier registration", text: "Find the separate pathway for independent outside carriers." },
];

export default function Careers() {
  return <main className="careers-v2">
    <a className="cv2-back" href="/">← BC LOGISTICS LLC</a>
    <section className="cv2-hero">
      <div className="cv2-kicker">CAREERS & RECRUITMENT <span>•</span> PEOPLE. OPERATIONS. PROGRESS.</div>
      <h1>Build the team<br/><em>behind the freight.</em></h1>
      <p className="cv2-lead">Explore the people and professional capabilities that will power the next chapter of BC Logistics LLC.</p>
      <p className="cv2-disclaimer">BC Logistics LLC is planning future workforce capacity for 600+ employees. This is a long-term planning target—not current headcount, a promise of employment, or a statement that 600+ vacancies are available.</p>
      <div className="cv2-actions">
        <a className="cv2-button" href="/careers/apply">Submit an employment application <span>↗</span></a>
        <a className="cv2-text-link" href="/careers/process">How recruitment works <span>→</span></a>
      </div>
      <div className="cv2-stat"><strong>600+</strong><span>PLANNED FUTURE WORKFORCE CAPACITY</span></div>
    </section>

    <section className="cv2-section">
      <div className="cv2-section-heading"><div><div className="cv2-kicker">THE COMPANY PLAN</div><h2>Eight areas of<br/><em>opportunity.</em></h2></div><p>These are organizational areas in the long-term operating plan. Individual positions, qualifications, schedules, and vacancies will be listed only after management formally approves them.</p></div>
      <div className="cv2-departments">{departments.map(([n,title,desc])=><article className="cv2-department" key={n}><span>{n}</span><div><h3>{title}</h3><p>{desc}</p></div><i>↗</i></article>)}</div>
      <a className="cv2-underlink" href="/careers/departments">View department overview <span>→</span></a>
    </section>

    <section className="cv2-section cv2-resource-section">
      <div className="cv2-kicker">CAREER INFORMATION CENTER</div><h2>Start with the <em>details.</em></h2>
      <p className="cv2-section-intro">Find out how recruitment is intended to work, what the company values, and where employment and carrier pathways differ.</p>
      <div className="cv2-resources">{resources.map(item=><a className="cv2-resource" href={item.href} key={item.href}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><b>↗</b></a>)}</div>
    </section>

    <section className="cv2-application">
      <div><div className="cv2-kicker">TAKE THE NEXT STEP</div><h2>Interested in joining<br/><em>our workforce?</em></h2><p>Submit an employment application for the department and position that best match your interests. Submission does not guarantee an interview, job offer, or employment.</p></div>
      <a className="cv2-button" href="/careers/apply">Start employment application <span>↗</span></a>
    </section>

    <section className="cv2-wholesale">
      <div className="cv2-kicker">A SEPARATE BUSINESS PATHWAY</div><h2>Outside carriers are<br/><em>not employees.</em></h2>
      <p>BC Logistics LLC's customer model is business-to-business wholesale. Independent outside carriers may be considered through a separate carrier registration process. Carrier registration is not an employment application and does not establish an employment relationship.</p>
      <a className="cv2-underlink" href="/careers/carriers">Explore carrier registration information <span>→</span></a>
    </section>
    <footer className="cv2-footer"><a href="/">BC LOGISTICS LLC</a><span>CAREERS & RECRUITMENT</span><a href="/careers/faq">Recruitment FAQ ↗</a></footer>
  </main>;
}
