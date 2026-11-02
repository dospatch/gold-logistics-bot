import { NextRequest,NextResponse } from "next/server";
import { getApplicant } from "@/lib/applicant";
export async function GET(request:NextRequest) {
 const user=getApplicant(request);
 return NextResponse.json({authenticated:!!user,user:user?{id:user.id,username:user.username,globalName:user.globalName}:null},{headers:{"Cache-Control":"no-store"}});
}
