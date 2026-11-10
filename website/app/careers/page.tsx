import type { Metadata } from "next";
import "./careers-v2.css";

export const metadata: Metadata = {
  title: "Careers & Recruitment",
  description: "Explore driver and team opportunities with BC Gold Logistics, a multiplayer American Truck Simulator virtual trucking company.",
};

const departments = [
  ["01", "Transportation & Driver Operations", "Company drivers, route execution, driver standards, and delivery activity."],
  ["02", "Dispatch & Freight Coordination", "Load planning, route coordination, assignments, and driver support."],
  ["03", "Fleet & Equipment Management", "Company truck and trailer records, assignments, inspections, and maintenance tracking."],
  ["04", "Safety & Training", "Driver onboarding, safe operating practices, training, and incident reporting."],
  ["05", "Human Resources & Recruitment", "Applications, onboarding, member support, and company staffing."],
  ["06", "Technology & Systems", "Website, Discord systems, company tools, records, and technical support."],
  ["07", "Convoy & Community Operations", "Multiplayer Convoy planning, event coordination, and community activities."],
  ["08", "Executive & Company Administration", "Company direction, policy, department coordination, and oversight."],
];

const resources = [
  { href: "/careers/open-positions", number: "01", title: "Open positions", text: "Review formally approved company roles and current recruitment availability." },
  { href: "/careers/departments", number: "02", title: "Explore departments", text: "Learn how the VTC is organized and where team members contribute." },
  { href: "/careers/process", number: "03", title: "Recruitment process", text: "Understand application review and driver or staff onboarding." },
  { href: "/careers/working-here", number: "04", title: "Working with the company", text: "Review the standards expected across Discord and multiplayer operations." },
  { href: "/careers/onboarding", number: "05", title: "Training & onboarding", text: "Learn how approved members are introduced to company operations." },
  { href: "/careers/handbook", number: "06", title: "Company handbook", text: "Review published VTC policies and operating expectations." },
  { href: "/careers/faq", number: "07", title: "Recruitment FAQ", text: "Get answers about applications, membership, and company activity." },
  { href: "/careers/track", number: "08", title: "Applicant center", text: "Sign in securely to view your own application status." },
];

export default function Careers() {
  return <main className="careers-v2">
    <a className="cv2-back" href="/">← BC GOLD LOGISTICS</a>
    <section className="cv2-hero">
      <div className="cv2-kicker">CAREERS & RECRUITMENT <span>•</span> PEOPLE. OPERATIONS. PROGRESS.</div>
      <h1>Find your place<br/><em>on the open road.</em></h1>
      <p className="cv2-lead">BC Gold Logistics is a multiplayer American Truck Simulator virtual trucking company. Our team brings drivers, dispatch, fleet coordination, safety, technology, and convoy operations together.</p>
      <p className="cv2-disclaimer">This is a virtual trucking company. Roles relate to our ATS multiplayer community and company operations; they are not real-world employment, commercial driving jobs, or physical warehouse positions.</p>
      <div className="cv2-actions">
        <a className="cv2-button" href="/careers/apply">Apply to join the company <span>↗</span></a>
        <a className="cv2-text-link" href="/careers/open-positions">View approved openings <span>→</span></a>
      </div>
      <div className="cv2-stat"><strong>ATS</strong><span>MULTIPLAYER VIRTUAL TRUCKING COMPANY</span></div>
    </section>

    <section className="cv2-section">
      <div className="cv2-section-heading"><div><div className="cv2-kicker">HOW WE ARE ORGANIZED</div><h2>One team.<br/><em>Connected operations.</em></h2></div><p>These departments describe the company structure. Specific staff vacancies and requirements will be published only when approved by company management.</p></div>
      <div className="cv2-departments">{departments.map(([n,title,desc])=><article className="cv2-department" key={n}><span>{n}</span><div><h3>{title}</h3><p>{desc}</p></div><i>↗</i></article>)}</div>
      <a className="cv2-underlink" href="/careers/departments">View department overview <span>→</span></a>
    </section>

    <section className="cv2-section cv2-resource-section">
      <div className="cv2-kicker">COMPANY INFORMATION CENTER</div><h2>Start with the <em>details.</em></h2>
      <p className="cv2-section-intro">Learn about membership, company standards, recruitment, and the tools used to coordinate multiplayer operations.</p>
      <div className="cv2-resources">{resources.map(item=><a className="cv2-resource" href={item.href} key={item.href}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><b>↗</b></a>)}</div>
    </section>

    <section className="cv2-application">
      <div><div className="cv2-kicker">TAKE THE NEXT STEP</div><h2>Ready to drive<br/><em>with the team?</em></h2><p>Submit an application for a driver or approved company team role. Applications are reviewed by authorized company staff. Submission does not guarantee acceptance or a specific position.</p></div>
      <a className="cv2-button" href="/careers/apply">Start your application <span>↗</span></a>
    </section>

    <footer className="cv2-footer"><a href="/">BC GOLD LOGISTICS</a><span>CAREERS & RECRUITMENT · ATS MULTIPLAYER VTC</span><a href="/careers/faq">Recruitment FAQ ↗</a></footer>
  </main>;
}
