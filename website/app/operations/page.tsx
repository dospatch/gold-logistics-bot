import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Operations",
  description: "How BC Gold Logistics coordinates multiplayer American Truck Simulator company operations.",
};

const divisions = [
  ["Executive & Company Administration", "Company direction, policies, planning, records, and coordination across operating departments."],
  ["Transportation & Driver Operations", "Driver onboarding, company standards, convoy participation, route planning, and driver support."],
  ["Dispatch & Freight Coordination", "Company load planning, driver assignments, route coordination, delivery updates, and operational communications."],
  ["Fleet & Equipment Management", "Company truck and trailer records, equipment assignments, inspections, maintenance reporting, and fleet planning."],
  ["Safety & Training", "Driver expectations, simulator safety practices, onboarding, training resources, and incident reporting."],
  ["Human Resources & Recruitment", "Applications, employee records, role assignments, internal support, and company development."],
  ["Technology & Systems", "Website, Discord, company tools, access control, data integrity, and future ATS telemetry integrations."],
  ["Convoy & Community Operations", "Multiplayer event planning, convoy schedules, route briefings, participation coordination, and post-run reporting."],
];

export default function Operations() {
  return (
    <main className="subpage">
      <a className="back brand-back" href="/"><img src="/BC%20Gold%20Logistics%20Emblem.png" alt="BC Gold Logistics" className="subpage-logo"/> <span>BC GOLD LOGISTICS</span></a>
      <div className="section-kicker">OUR OPERATING MODEL</div>
      <h1>One team.<br /><em>One coordinated operation.</em></h1>
      <p>
        BC Gold Logistics is a multiplayer American Truck Simulator virtual trucking company.
        Company activity is organized around ATS Convoy sessions, shared operating standards,
        coordinated freight runs, and a managed virtual fleet. TruckersMP is not required.
      </p>
      <div className="standard">
        <span>01</span>
        <div>
          <h2>How company driving works</h2>
          <p>
            Drivers join scheduled or announced company Convoy sessions, follow the route and
            event briefing, communicate with the team, and submit delivery information through
            the company workflow. Participation and activity records are maintained through
            company systems as those features become available.
          </p>
        </div>
      </div>
      {divisions.map(([title, body], index) => (
        <article className="standard" key={title}>
          <span>{String(index + 2).padStart(2, "0")}</span>
          <div><h2>{title}</h2><p>{body}</p></div>
        </article>
      ))}
      <p>
        BC Gold Logistics is an evolving virtual company. Fleet size, staffing, service coverage,
        and future divisions will be announced only when they are established. No real-world
        carrier authority, commercial freight service, or physical fleet is represented by this
        simulator community.
      </p>
    </main>
  );
}
