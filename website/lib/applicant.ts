import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
const COOKIE = "bcgl_applicant";
type Applicant = { id: string; username: string; globalName: string; exp: number };
function secret() {
  const value = process.env.WEB_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("WEB_SESSION_SECRET is not configured.");
  return value;
}
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
export function applicantCookie(user: Omit<Applicant,"exp">) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now()+2*60*60*1000 })).toString("base64url");
  return payload+"."+sign(payload);
}
export function getApplicant(request: NextRequest): Applicant | null {
  const raw=request.cookies.get(COOKIE)?.value; if(!raw) return null;
  const [payload,sig]=raw.split("."); if(!payload||!sig) return null;
  const expected=sign(payload), a=Buffer.from(sig), b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b)) return null;
  try { const user=JSON.parse(Buffer.from(payload,"base64url").toString()) as Applicant; return user.id && user.exp>Date.now()?user:null; } catch { return null; }
}
export const APPLICANT_COOKIE=COOKIE;
