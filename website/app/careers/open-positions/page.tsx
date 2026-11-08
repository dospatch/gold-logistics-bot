import type { Metadata } from "next";
import "../careers-v2.css";

export const metadata: Metadata = {
  title: "Open Positions",
  description: "Review formally approved employment vacancies at BC Logistics LLC.",
};

export default function OpenPositions() {
  return <main className="careers-v2">
    <a className="cv2-back" href="/careers">← CAREERS & RECRUITMENT</a>
    <div className="cv2-kicker">CAREER OPPORTUNITIES</div>
    <h1 className="cv2-page-title">Open positions.<br/><em>Official opportunities.</em></h1>
    <p className="cv2-lead">This page is the official place to review employment vacancies after they have been approved for recruitment by BC Logistics LLC management.</p>
    <section className="cv2-section">
      <div className="cv2-disclaimer">
        <strong>There are no formally approved vacancies published on this page at this time.</strong>
        <br/>The departments listed in the company plan describe future organizational capacity. They are not active job openings, and the 600+ workforce target is not a current headcount or vacancy total.
      </div>
      <h2>What happens next?</h2>
      <div className="cv2-departments">
        <article className="cv2-department"><span>01</span><div><h3>Management approval</h3><p>A position must be formally approved before it is advertised as an opening.</p></div></article>
        <article className="cv2-department"><span>02</span><div><h3>Published role details</h3><p>Approved listings will identify the department, position, qualifications, schedule information, and application instructions that are ready to be shared.</p></div></article>
        <article className="cv2-department"><span>03</span><div><h3>Recruitment review</h3><p>Applicants will receive updates through the official recruitment process and their private application channel.</p></div></article>
      </div>
    </section>
    <h2>Interested in future opportunities?</h2>
    <p className="cv2-section-intro">You can review the company departments and recruitment process while approved vacancies are being prepared. Submitting an application does not guarantee that a role is open or that an interview or offer will follow.</p>
    <div className="cv2-actions">
      <a className="cv2-button" href="/careers/apply">Employment application <span>↗</span></a>
      <a className="cv2-text-link" href="/careers/departments">Explore departments <span>→</span></a>
    </div>
  </main>;
}
