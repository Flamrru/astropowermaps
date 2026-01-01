import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const API_BASE = "https://connect.mailerlite.com/api";

interface GroupStats {
  id: string;
  name: string;
  active_count: number;
  open_rate: { float: number; string: string };
  click_rate: { float: number; string: string };
  sent_count: number;
}

interface CampaignStats {
  id: string;
  name: string;
  status: string;
  sent: number;
  opens_count: number;
  unique_opens_count: number;
  open_rate: { float: number; string: string };
  clicks_count: number;
  unique_clicks_count: number;
  click_rate: { float: number; string: string };
  unsubscribes_count: number;
  scheduled_for: string | null;
  finished_at: string | null;
}

export async function GET() {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  const leadsGroupId = process.env.MAILERLITE_LEADS_GROUP_ID;
  const customersGroupId = process.env.MAILERLITE_CUSTOMERS_GROUP_ID;

  if (!apiKey) {
    return NextResponse.json(
      { error: "MailerLite not configured", configured: false },
      { status: 200 }
    );
  }

  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    // Fetch groups and campaigns in parallel
    const [groupsResponse, campaignsResponse] = await Promise.all([
      fetch(`${API_BASE}/groups?limit=50`, { headers }),
      fetch(`${API_BASE}/campaigns?filter[status]=sent&limit=5&sort=-finished_at`, { headers }),
    ]);

    const groupsData = await groupsResponse.json();
    const campaignsData = await campaignsResponse.json();

    // Find our specific groups
    let leadsGroup: GroupStats | null = null;
    let customersGroup: GroupStats | null = null;

    if (groupsData.data) {
      for (const group of groupsData.data) {
        if (leadsGroupId && group.id === leadsGroupId) {
          leadsGroup = group;
        }
        if (customersGroupId && group.id === customersGroupId) {
          customersGroup = group;
        }
      }
    }

    // Get recent campaigns
    const recentCampaigns: CampaignStats[] = campaignsData.data || [];

    // Calculate aggregate stats from recent campaigns
    const totalSent = recentCampaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
    const totalOpens = recentCampaigns.reduce((sum, c) => sum + (c.unique_opens_count || 0), 0);
    const totalClicks = recentCampaigns.reduce((sum, c) => sum + (c.unique_clicks_count || 0), 0);
    const totalUnsubscribes = recentCampaigns.reduce((sum, c) => sum + (c.unsubscribes_count || 0), 0);

    const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;

    return NextResponse.json({
      configured: true,
      groups: {
        leads: leadsGroup
          ? {
              name: leadsGroup.name,
              subscribers: leadsGroup.active_count,
              openRate: leadsGroup.open_rate?.float || 0,
              clickRate: leadsGroup.click_rate?.float || 0,
            }
          : null,
        customers: customersGroup
          ? {
              name: customersGroup.name,
              subscribers: customersGroup.active_count,
              openRate: customersGroup.open_rate?.float || 0,
              clickRate: customersGroup.click_rate?.float || 0,
            }
          : null,
      },
      campaigns: {
        totalSent,
        avgOpenRate,
        avgClickRate,
        totalUnsubscribes,
        recent: recentCampaigns.slice(0, 3).map((c) => ({
          name: c.name,
          sent: c.sent,
          openRate: c.open_rate?.float || 0,
          clickRate: c.click_rate?.float || 0,
          finishedAt: c.finished_at,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching MailerLite stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch MailerLite stats", configured: true },
      { status: 500 }
    );
  }
}
