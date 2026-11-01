import { NextRequest, NextResponse } from "next/server";
import { discordApi, requireManager, reviewChannelId } from "@/lib/management";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const { session, response } = await requireManager(request);
  if (!session) return response!;
  try {
    const channelId = await reviewChannelId();
    const result = await discordApi("/channels/" + channelId + "/messages?limit=100");
    if (!result.ok) return NextResponse.json({ error: "Discord could not load the application queue." }, { status: 502 });
    const messages = await result.json();
    const applications = messages.flatMap((message: any) => {
      const embed = message.embeds?.[0];
      if (!embed) return [];
      const fields = embed.fields || [];
      const get = (name: string) => fields.find((field: any) => field.name === name)?.value || "";
      const applicantField = get("Applicant");
      const applicantId = applicantField.match(/ID:\s*(\d{17,20})/)?.[1];
      if (!applicantId) return [];
      return [{
        id: message.id, applicantId, applicant: applicantField.replace(/\s*\(ID:.*$/, ""),
        games: get("Game"), truck: get("Preferred truck"), experience: get("Experience"),
        availability: get("Availability"), about: get("Why they want to join"),
        status: get("Status") || "Pending", createdAt: message.timestamp
      }];
    }).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ applications }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load applications." }, { status: 500 });
  }
}
