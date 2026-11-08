"use client";
import {useEffect,useState} from "react";
type Vacancy={id:string;title:string;department:string;location:string;employmentType:string;schedule:string;summary:string;qualifications:string;responsibilities:string;status:string;updatedAt:string};
export default function VacancyBoard(){
 const [items,setItems]=useState<Vacancy[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/careers/vacancies",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Vacancies could not be loaded.");setItems(d.vacancies||[]);}).catch(e=>setError(e.message||"Vacancies could not be loaded.")).finally(()=>setLoading(false));},[]);
 return <div className="cv2-live-vacancies">
  {loading?<div className="cv2-disclaimer">Loading approved openings…</div>:error?<div className="cv2-disclaimer">{error}</div>:items.length===0?<div className="cv2-disclaimer"><strong>There are no formally approved vacancies published at this time.</strong><br/>The departments in the company plan are future organizational areas, not active job openings. The 600+ workforce capacity target is not current headcount or a vacancy total.</div>:items.map(v=><article className="cv2-vacancy" key={v.id}>
    <div className="cv2-vacancy-top"><span>{v.department}</span><small>{v.employmentType}</small></div>
    <h2>{v.title}</h2><p>{v.summary}</p>
    <div className="cv2-vacancy-meta"><span>⌖ {v.location||"Location to be confirmed"}</span><span>◷ {v.schedule||"Schedule to be confirmed"}</span></div>
    {v.qualifications&&<div className="cv2-vacancy-detail"><b>Qualifications</b><p>{v.qualifications}</p></div>}
    {v.responsibilities&&<div className="cv2-vacancy-detail"><b>Responsibilities</b><p>{v.responsibilities}</p></div>}
    <a className="cv2-button" href={"/careers/apply?position="+encodeURIComponent(v.title)+"&department="+encodeURIComponent(v.department)}>Apply for this position <span>↗</span></a>
  </article>)}
 </div>;
}
