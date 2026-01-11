import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStripeSecretKey } from "@/lib/stripe-config";
import {
  categorizeMessage,
  classifyEngagement,
  STELLA_TOPICS,
  type TopicKey,
  type EngagementLevel,
} from "@/lib/tracking";

const COOKIE_NAME = "tracking_session";

function getStripe() {
  const key = getStripeSecretKey();
  if (!key) return null;
  return new Stripe(key);
}

interface SegmentData {
  segment: string;
  label: string;
  userCount: number;
  totalRevenue: number;
  avgLTV: number;
  color: string;
}

/**
 * GET /api/tracking/revenue
 *
 * Returns revenue segmentation data.
 *
 * Query params:
 * - segment_by: payment_type | engagement | topics (default: payment_type)
 * - from: ISO date string
 * - to: ISO date string
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
    const segmentBy = searchParams.get("segment_by") || "payment_type";

    // Fetch all profiles with Stripe customer IDs
    const { data: profiles } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, payment_type, subscription_status, stripe_customer_id");

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ segments: [], total: 0 });
    }

    // Fetch message counts for engagement calculation
    const { data: messageCounts } = await supabaseAdmin
      .from("stella_messages")
      .select("user_id")
      .eq("role", "user")
      .is("deleted_at", null);

    const messageCountMap = new Map<string, number>();
    for (const msg of messageCounts || []) {
      messageCountMap.set(msg.user_id, (messageCountMap.get(msg.user_id) || 0) + 1);
    }

    // Fetch topics for each user
    const { data: userMessages } = await supabaseAdmin
      .from("stella_messages")
      .select("user_id, content")
      .eq("role", "user")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(2000);

    const userTopicsMap = new Map<string, Set<TopicKey>>();
    for (const msg of userMessages || []) {
      if (!userTopicsMap.has(msg.user_id)) {
        userTopicsMap.set(msg.user_id, new Set());
      }
      const topics = categorizeMessage(msg.content);
      topics.forEach((t) => userTopicsMap.get(msg.user_id)!.add(t));
    }

    // Get LTV from Stripe
    const stripe = getStripe();
    const ltvMap = new Map<string, number>();
    let totalRevenue = 0;

    if (stripe) {
      const customerIds = profiles
        .filter((p) => p.stripe_customer_id)
        .map((p) => p.stripe_customer_id as string);

      for (const customerId of customerIds) {
        try {
          const charges = await stripe.charges.list({
            customer: customerId,
            limit: 100,
          });
          const ltv = charges.data
            .filter((c) => c.status === "succeeded")
            .reduce((sum, c) => sum + c.amount, 0) / 100;
          ltvMap.set(customerId, ltv);
          totalRevenue += ltv;
        } catch {
          // Skip failed lookups
        }
      }
    }

    // Build user data with all attributes
    const usersWithData = profiles.map((profile) => {
      const chatCount = messageCountMap.get(profile.user_id) || 0;
      const ltv = profile.stripe_customer_id
        ? ltvMap.get(profile.stripe_customer_id) || 0
        : 0;
      const topics = Array.from(userTopicsMap.get(profile.user_id) || []);
      const engagement = classifyEngagement(chatCount);
      const primaryTopic = topics[0] || "general";

      return {
        user_id: profile.user_id,
        payment_type: profile.payment_type || "none",
        subscription_status: profile.subscription_status,
        ltv,
        engagement,
        topics,
        primaryTopic,
      };
    });

    // Segment data
    let segments: SegmentData[] = [];

    if (segmentBy === "payment_type") {
      const paymentTypes = [
        { key: "subscription", label: "Subscribers", color: "#10B981" },
        { key: "one_time", label: "One-Time", color: "#3B82F6" },
        { key: "grandfathered", label: "Free Access", color: "#8B5CF6" },
        { key: "none", label: "No Payment", color: "#6B7280" },
      ];

      segments = paymentTypes.map(({ key, label, color }) => {
        const usersInSegment = usersWithData.filter((u) => u.payment_type === key);
        const revenue = usersInSegment.reduce((sum, u) => sum + u.ltv, 0);
        return {
          segment: key,
          label,
          userCount: usersInSegment.length,
          totalRevenue: Math.round(revenue * 100) / 100,
          avgLTV: usersInSegment.length > 0 ? Math.round((revenue / usersInSegment.length) * 100) / 100 : 0,
          color,
        };
      });
    } else if (segmentBy === "engagement") {
      const engagementLevels: Array<{
        key: EngagementLevel;
        label: string;
        color: string;
      }> = [
        { key: "high", label: "Power Users (20+)", color: "#10B981" },
        { key: "medium", label: "Regular (5-19)", color: "#3B82F6" },
        { key: "low", label: "Light (1-4)", color: "#F59E0B" },
        { key: "dormant", label: "Dormant (0)", color: "#6B7280" },
      ];

      segments = engagementLevels.map(({ key, label, color }) => {
        const usersInSegment = usersWithData.filter((u) => u.engagement === key);
        const revenue = usersInSegment.reduce((sum, u) => sum + u.ltv, 0);
        return {
          segment: key,
          label,
          userCount: usersInSegment.length,
          totalRevenue: Math.round(revenue * 100) / 100,
          avgLTV: usersInSegment.length > 0 ? Math.round((revenue / usersInSegment.length) * 100) / 100 : 0,
          color,
        };
      });
    } else if (segmentBy === "topics") {
      const topicKeys = Object.keys(STELLA_TOPICS) as TopicKey[];

      segments = topicKeys
        .map((key) => {
          const topic = STELLA_TOPICS[key];
          const usersInSegment = usersWithData.filter((u) => u.topics.includes(key));
          const revenue = usersInSegment.reduce((sum, u) => sum + u.ltv, 0);
          return {
            segment: key,
            label: topic.label,
            userCount: usersInSegment.length,
            totalRevenue: Math.round(revenue * 100) / 100,
            avgLTV: usersInSegment.length > 0 ? Math.round((revenue / usersInSegment.length) * 100) / 100 : 0,
            color: topic.color,
          };
        })
        .filter((s) => s.userCount > 0)
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    // Filter out empty segments for display
    const displaySegments = segments.filter((s) => s.userCount > 0 || s.segment !== "none");

    return NextResponse.json({
      segments: displaySegments,
      total: {
        users: usersWithData.length,
        revenue: Math.round(totalRevenue * 100) / 100,
        avgLTV: usersWithData.length > 0
          ? Math.round((totalRevenue / usersWithData.length) * 100) / 100
          : 0,
      },
      segmentBy,
    });
  } catch (error) {
    console.error("Tracking revenue API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}
