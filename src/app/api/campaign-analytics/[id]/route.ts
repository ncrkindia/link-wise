import { getSession } from "@/lib/auth";
import { getCampaignSends } from "@/lib/data-email";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaignId = params.id;

  try {
    // Verify ownership of the campaign
    const campaigns = await query<any[]>(
      "SELECT id FROM email_campaigns WHERE id = ? AND user_id = ?",
      [campaignId, session.id]
    );

    if (campaigns.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const sends = await getCampaignSends(campaignId);
    return NextResponse.json(sends);
  } catch (error) {
    console.error("Failed to fetch campaign analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
