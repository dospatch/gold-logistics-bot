import { NextRequest, NextResponse } from "next/server";
import { discordApi, requireManager, reviewChannelId } from "@/lib/management";
export const runtime = "nodejs";
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireManager(request);
  if (!session) return response!;
  try {
    const { id } = await context.params;
    if (!/^\d{17,20}$/.test(id)) return NextResponse.json({ error: "Invalid application ID." }, { status: 400 });
    const body = await request.json();
    if (!["approve", "deny"].includes(body.decision)) return NextResponse.json({ error: "Choose approve or deny." }, { status: 400 });
    const channelId = await reviewChannelId();
    const messageResponse = await discordApi("/channels/" + channelId + "/messages/" + id);
    if (!messageResponse.ok) return NextResponse.json({ error: "Application record was not found." }, { status: 404 });
    const message = await messageResponse.json();
    const fields = message.embeds?.[0]?.fields || [];
    const get = (name: string) => fields.find((field: any) => field.name === name)?.value || "";
    const applicantId = get("Applicant").match(/ID:\s*(\d{17,20})/)?.[1];
    if (!applicantId) return NextResponse.json({ error: "Applicant information is missing." }, { status: 422 });
    if ((get("Status") || "Pending") !== "Pending") return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });
    const approved = body.decision === "approve";
    const status = approved ? "Approved" : "Denied";
    const embed = { ...message.embeds[0], color: approved ? 0x2ecc71 : 0xe74c3c,
      fields: [...fields.filter((field: any) => !["Status", "Decision"].includes(field.name)),
        { name: "Status", value: status, inline: true },
        { name: "Decision", value: "Reviewed by " + session.username + " (website)", inline: true }] };
    const edit = await discordApi("/channels/" + channelId + "/messages/" + id, { method: "PATCH", body: JSON.stringify({ embeds: [embed], components: [] }) });
    if (!edit.ok) return NextResponse.json({ error: "Could not update the Discord application record." }, { status: 502 });
    let dmDelivered = true;
    try {
      const dm = await discordApi("/users/@me/channels", { method: "POST", body: JSON.stringify({ recipient_id: applicantId }) });
      if (!dm.ok) throw new Error("Could not open applicant DM.");
      const dmChannel = await dm.json();
      const content = approved
        ? "🎉 Congratulations! Company management has approved your BC Gold Logistics driver application. Welcome to BC Gold Logistics! Please check the server for your next steps."
        : "Thank you for your interest in BC Gold Logistics. After reviewing your application, company management has decided not to move forward at this time. We appreciate the time you took to apply.";
      const sent = await discordApi("/channels/" + dmChannel.id + "/messages", { method: "POST", body: JSON.stringify({ content: content + "\n\nApplication status: **" + status + "**" }) });
      if (!sent.ok) throw new Error("Could not deliver applicant DM.");
    } catch { dmDelivered = false; }
    return NextResponse.json({ ok: true, status, dmDelivered });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Decision failed." }, { status: 500 });
  }
}
