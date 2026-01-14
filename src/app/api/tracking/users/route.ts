import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStripeSecretKey } from "@/lib/stripe-config";
import {
  categorizeMessage,
  classifyEngagement,
  type TopicKey,
  type EngagementLevel,
} from "@/lib/tracking";

const COOKIE_NAME = "tracking_session";

// Helper to get Stripe instance
function getStripe() {
  const key = getStripeSecretKey();
  if (!key) return null;
  return new Stripe(key);
}

interface UserData {
  user_id: string;
  email: string;
  display_name: string | null;
  payment_type: string | null;
  subscription_status: string | null;
  ltv: number;
  session_count: number;
  chat_count: number;
  last_active: string | null;
  topics: TopicKey[];
  engagement: EngagementLevel;
  created_at: string;
}

/**
 * GET /api/tracking/users
 *
 * Returns list of users with analytics data, or single user detail.
 *
 * Query params:
 * - user_id: Get single user detail (includes activity + conversations)
 * - search: Search by email or name
 * - payment_type: Filter (one_time, subscription, grandfathered, none)
 * - engagement: Filter (high, medium, low, dormant)
 * - topics: Filter by comma-separated topics
 * - sort: Column to sort by
 * - order: asc or desc
 * - limit: Number of results (default 50)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // If user_id provided, return single user detail
    if (userId) {
      return await getUserDetail(userId);
    }

    // Otherwise, return user list
    return await getUserList(searchParams);
  } catch (error) {
    console.error("Tracking users API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * Get detailed info for a single user
 */
async function getUserDetail(userId: string) {
  // Fetch user profile
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch auth user for email
  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
  const email = authData.user?.email || "Unknown";

  // Fetch Stella messages for this user
  const { data: messages } = await supabaseAdmin
    .from("stella_messages")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);

  // Fetch app events for activity timeline
  const { data: events } = await supabaseAdmin
    .from("app_events")
    .select("event_name, event_category, properties, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  // Calculate topics from messages
  const userMessages = (messages || []).filter((m) => m.role === "user");
  const allTopics: TopicKey[] = [];
  for (const msg of userMessages) {
    const topics = categorizeMessage(msg.content);
    allTopics.push(...topics);
  }

  // Count topic frequencies
  const topicCounts: Record<string, number> = {};
  for (const topic of allTopics) {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }

  // Get top topics
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic as TopicKey);

  // Get Stripe payment info
  let stripeData = null;
  if (profile.stripe_customer_id) {
    const stripe = getStripe();
    if (stripe) {
      try {
        // Get charges for LTV
        const charges = await stripe.charges.list({
          customer: profile.stripe_customer_id,
          limit: 100,
        });

        const successfulCharges = charges.data.filter((c) => c.status === "succeeded");
        const ltv = successfulCharges.reduce((sum, c) => sum + c.amount, 0) / 100;
        const lastCharge = successfulCharges[0];

        // Get subscription
        let subscription = null;
        if (profile.subscription_id) {
          try {
            const sub = await stripe.subscriptions.retrieve(profile.subscription_id);
            // Get current_period_end from subscription items (Stripe SDK TypeScript pattern)
            const currentPeriodEnd = sub.items.data[0]?.current_period_end;
            subscription = {
              status: sub.status,
              currentPeriodEnd: currentPeriodEnd
                ? new Date(currentPeriodEnd * 1000).toISOString()
                : new Date().toISOString(),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            };
          } catch {
            // Subscription may not exist
          }
        }

        stripeData = {
          ltv,
          paymentCount: successfulCharges.length,
          lastPayment: lastCharge
            ? {
                amount: lastCharge.amount / 100,
                date: new Date(lastCharge.created * 1000).toISOString(),
              }
            : null,
          subscription,
        };
      } catch (stripeError) {
        console.error("Stripe fetch error:", stripeError);
      }
    }
  }

  // Group messages into conversations (by day)
  const conversations: Array<{
    date: string;
    topics: TopicKey[];
    messages: Array<{ role: string; content: string; created_at: string }>;
    preview: string;
  }> = [];

  const messagesByDay: Record<string, Array<{ id: string; role: string; content: string; created_at: string }>> = {};
  for (const msg of messages || []) {
    const day = msg.created_at.split("T")[0];
    if (!messagesByDay[day]) messagesByDay[day] = [];
    messagesByDay[day].push(msg);
  }

  for (const [date, dayMessages] of Object.entries(messagesByDay)) {
    const dayTopics = new Set<TopicKey>();
    for (const msg of dayMessages) {
      if (msg.role === "user") {
        const topics = categorizeMessage(msg.content);
        topics.forEach((t) => dayTopics.add(t));
      }
    }

    const firstUserMessage = dayMessages.find((m) => m.role === "user");
    // Sort messages by timestamp ascending (oldest first) to ensure correct order
    const sortedMessages = [...dayMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    conversations.push({
      date,
      topics: Array.from(dayTopics),
      messages: sortedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        created_at: m.created_at,
      })),
      preview: firstUserMessage
        ? firstUserMessage.content.substring(0, 100) + (firstUserMessage.content.length > 100 ? "..." : "")
        : "",
    });
  }

  // Format activity timeline
  const activity = (events || []).map((e) => {
    const props = e.properties as Record<string, unknown>;
    let details = e.event_name;

    if (e.event_name === "page_view" && props?.screen) {
      details = `Viewed ${props.screen}`;
    } else if (e.event_name === "feature_use" && props?.feature) {
      details = `Used ${props.feature}`;
    } else if (e.event_name === "stella_chat_open") {
      details = "Opened Stella chat";
    }

    return {
      date: e.created_at,
      event: e.event_name,
      category: e.event_category,
      details,
    };
  });

  return NextResponse.json({
    user: {
      user_id: userId,
      email,
      display_name: profile.display_name,
      payment_type: profile.payment_type || "none",
      subscription_status: profile.subscription_status,
      created_at: profile.created_at,
      birth_data: profile.birth_date
        ? {
            date: profile.birth_date,
            time: profile.birth_time,
            location: profile.birth_place,
          }
        : null,
      topics: topTopics,
      chat_count: userMessages.length,
      engagement: classifyEngagement(userMessages.length),
    },
    stripe: stripeData,
    activity,
    conversations,
  });
}

/**
 * Get paginated list of users with filters
 */
async function getUserList(searchParams: URLSearchParams) {
  const search = searchParams.get("search")?.toLowerCase();
  const paymentTypeFilter = searchParams.get("payment_type");
  const engagementFilter = searchParams.get("engagement") as EngagementLevel | null;
  const topicsFilter = searchParams.get("topics")?.split(",") as TopicKey[] | undefined;
  const sortBy = searchParams.get("sort") || "created_at";
  const sortOrder = searchParams.get("order") || "desc";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Fetch all profiles
  let query = supabaseAdmin.from("user_profiles").select("*");

  // Apply payment_type filter
  if (paymentTypeFilter) {
    query = query.eq("payment_type", paymentTypeFilter);
  }

  const { data: profiles } = await query;

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ users: [], total: 0 });
  }

  // Fetch all auth users for email mapping
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
  const emailMap = new Map<string, string>();
  for (const user of authData?.users || []) {
    emailMap.set(user.id, user.email || "");
  }

  // Fetch message counts per user
  const { data: messageCounts } = await supabaseAdmin
    .from("stella_messages")
    .select("user_id")
    .eq("role", "user")
    .is("deleted_at", null);

  const messageCountMap = new Map<string, number>();
  for (const msg of messageCounts || []) {
    messageCountMap.set(msg.user_id, (messageCountMap.get(msg.user_id) || 0) + 1);
  }

  // Fetch recent messages for topic analysis
  const { data: recentMessages } = await supabaseAdmin
    .from("stella_messages")
    .select("user_id, content")
    .eq("role", "user")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1000);

  // Build topic map per user
  const userTopicsMap = new Map<string, Set<TopicKey>>();
  for (const msg of recentMessages || []) {
    if (!userTopicsMap.has(msg.user_id)) {
      userTopicsMap.set(msg.user_id, new Set());
    }
    const topics = categorizeMessage(msg.content);
    topics.forEach((t) => userTopicsMap.get(msg.user_id)!.add(t));
  }

  // Fetch last active from events
  const { data: lastEvents } = await supabaseAdmin
    .from("app_events")
    .select("user_id, created_at")
    .not("user_id", "is", null)
    .order("created_at", { ascending: false });

  const lastActiveMap = new Map<string, string>();
  for (const event of lastEvents || []) {
    if (!lastActiveMap.has(event.user_id)) {
      lastActiveMap.set(event.user_id, event.created_at);
    }
  }

  // Fetch session counts
  const { data: sessionData } = await supabaseAdmin
    .from("app_events")
    .select("user_id, session_id")
    .not("user_id", "is", null);

  const sessionCountMap = new Map<string, Set<string>>();
  for (const event of sessionData || []) {
    if (!sessionCountMap.has(event.user_id)) {
      sessionCountMap.set(event.user_id, new Set());
    }
    if (event.session_id) {
      sessionCountMap.get(event.user_id)!.add(event.session_id);
    }
  }

  // Get Stripe LTV data (batch)
  const stripe = getStripe();
  const ltvMap = new Map<string, number>();

  if (stripe) {
    const customerIds = profiles
      .filter((p) => p.stripe_customer_id)
      .map((p) => p.stripe_customer_id as string);

    // Batch fetch charges (this is expensive, cache in production)
    for (const customerId of customerIds.slice(0, 50)) {
      try {
        const charges = await stripe.charges.list({
          customer: customerId,
          limit: 100,
        });
        const ltv = charges.data
          .filter((c) => c.status === "succeeded")
          .reduce((sum, c) => sum + c.amount, 0) / 100;
        ltvMap.set(customerId, ltv);
      } catch {
        // Skip failed lookups
      }
    }
  }

  // Build user list
  let users: UserData[] = profiles.map((profile) => {
    const email = emailMap.get(profile.user_id) || "";
    const chatCount = messageCountMap.get(profile.user_id) || 0;
    const userTopics = Array.from(userTopicsMap.get(profile.user_id) || []);
    const sessionCount = sessionCountMap.get(profile.user_id)?.size || 0;
    const ltv = profile.stripe_customer_id
      ? ltvMap.get(profile.stripe_customer_id) || 0
      : 0;

    return {
      user_id: profile.user_id,
      email,
      display_name: profile.display_name,
      payment_type: profile.payment_type || "none",
      subscription_status: profile.subscription_status,
      ltv,
      session_count: sessionCount,
      chat_count: chatCount,
      last_active: lastActiveMap.get(profile.user_id) || null,
      topics: userTopics as TopicKey[],
      engagement: classifyEngagement(chatCount),
      created_at: profile.created_at,
    };
  });

  // Apply search filter
  if (search) {
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        u.display_name?.toLowerCase().includes(search)
    );
  }

  // Apply engagement filter
  if (engagementFilter) {
    users = users.filter((u) => u.engagement === engagementFilter);
  }

  // Apply topics filter
  if (topicsFilter && topicsFilter.length > 0) {
    users = users.filter((u) =>
      topicsFilter.some((topic) => u.topics.includes(topic))
    );
  }

  // Sort
  const sortMultiplier = sortOrder === "asc" ? 1 : -1;
  users.sort((a, b) => {
    const aVal = a[sortBy as keyof UserData];
    const bVal = b[sortBy as keyof UserData];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * sortMultiplier;
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * sortMultiplier;
    }

    return 0;
  });

  const total = users.length;

  // Apply pagination
  users = users.slice(offset, offset + limit);

  return NextResponse.json({
    users,
    total,
    limit,
    offset,
  });
}
