import type { Metadata } from "next";
import "../careers-v2.css";

export const metadata: Metadata = {
  title: "Company Handbook & Policies",
  description: "Employee handbook publication status and policy information for BC Gold Logistics.",
};

const planned = [
  ["Workplace conduct", "Professional expectations, respectful conduct, integrity, and accountability."],
  ["Convoy attendance & scheduling", "Approved attendance procedures, Convoy participation expectations, and schedule communication."],
  ["Safety & reporting", "Workplace safety expectations, incident reporting, and escalation channels."],
  ["Equipment & systems", "Responsibilities for assigned virtual fleet assets, accounts, systems, and information."],
  ["Leave & member support", "Approved leave procedures and member support contacts, when established."],
  ["Performance & development", "Feedback, performance review, training, and development procedures."],
];

export default function EmployeeHandbook() {
  return <main className="careers-v2">
    <a className="cv2-back" href="/careers">← CAREERS & RECRUITMENT</a>
    <div className="cv2-kicker">EMPLOYEE RESOURCES</div>
    <h1 className="cv2-page-title">Clear standards.<br/><em>Shared expectations.</em></h1>
    <p className="cv2-lead">The company handbook will bring formally approved company operating policies and procedures together in one place for BC Gold Logistics team members.</p>
    <section className="cv2-section">
      <div className="cv2-disclaimer">
        <strong>Official company handbook not yet published.</strong>
        <br/>The topics below are a planning outline, not active company policy. No compensation, benefits, leave entitlement, schedule, disciplinary rule, or employment term should be inferred until the applicable policy is formally approved and published.
      </div>
      <h2>Planned handbook topics</h2>
      <div className="cv2-departments">
        {planned.map(([title,desc],i)=><article className="cv2-department" key={title}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{desc}</p></div></article>)}
      </div>
    </section>
    <h2>Need recruitment information?</h2>
    <p className="cv2-section-intro">Applicants can review the recruitment process and frequently asked questions. These pages explain the current application process and do not replace an approved company handbook.</p>
    <div className="cv2-actions">
      <a className="cv2-button" href="/careers/process">Recruitment process <span>↗</span></a>
      <a className="cv2-text-link" href="/careers/faq">Recruitment FAQ <span>→</span></a>
    </div>
  </main>;
}
