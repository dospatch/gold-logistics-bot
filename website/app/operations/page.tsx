import type { Metadata } from "next";
export const metadata: Metadata = { title: "Operations" };
const areas=[
["Transportation & Dispatch","Company fleet planning, driver assignments, route coordination, shipment tracking, and 24-hour dispatch coverage."],
["Distribution Center","24/7 wholesale receiving and shipping, storage, cross-docking, staging, inventory control, and temperature-controlled areas."],
["Fleet Services","Eight planned maintenance bays, inspections, parts support, truck washing, and company diesel fueling."],
["Carrier Services","Registration and appointment processes for approved outside carriers, with separate staging and check-in."],
["People & Safety","Recruitment, onboarding, training, employee services, safety, compliance, and security."],
["Campus Infrastructure","Corporate headquarters, employee and visitor parking, truck circulation, gate controls, cameras, backup power, fire protection, and utilities."]
];
export default function Operations(){return <main className="subpage"><a className="back" href="/">← BC LOGISTICS LLC</a><div className="section-kicker">HOW THE COMPANY WORKS</div><h1>One connected<br/><em>operating campus.</em></h1><p>BC Logistics LLC is planning a wholesale-focused regional operation built around 300+ company trucks, 600+ employee capacity, and a distribution center that runs 24 hours a day.</p>{areas.map(([title,body],i)=><article className="standard" key={title}><span>0{i+1}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}<p>Facility dimensions, final parking capacity, shift schedules, and detailed dock assignments remain subject to the approved master site plan.</p></main>}
