import type { Metadata } from "next";
import "../careers-v2.css";
import VacancyBoard from "./vacancy-board";

export const metadata: Metadata = {
  title: "Open Positions",
  description: "Review formally approved company openings at BC Gold Logistics.",
};

export default function OpenPositions() {
  return <main className="careers-v2">
    <a className="cv2-back" href="/careers">← CAREERS & RECRUITMENT</a>
    <div className="cv2-kicker">CAREER OPPORTUNITIES</div>
    <h1 className="cv2-page-title">Open positions.<br/><em>Official opportunities.</em></h1>
    <p className="cv2-lead">Explore company roles formally approved for recruitment by BC Gold Logistics management.</p>
    <section className="cv2-section">
      <VacancyBoard />
      <h2>How openings are published</h2>
      <p className="cv2-section-intro">Only listings approved and published by authorized management appear here. Department plans and the 600+ future workforce capacity target are not active job openings or current headcount.</p>
      <div className="cv2-actions"><a className="cv2-button" href="/careers/apply">Employment application <span>↗</span></a><a className="cv2-text-link" href="/careers/departments">Explore departments <span>→</span></a></div>
    </section>
  </main>;
}
