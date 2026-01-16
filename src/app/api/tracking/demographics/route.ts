import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "tracking_session";

// Sun sign date ranges
const SUN_SIGNS = [
  { sign: "Aries", start: [3, 21], end: [4, 19] },
  { sign: "Taurus", start: [4, 20], end: [5, 20] },
  { sign: "Gemini", start: [5, 21], end: [6, 20] },
  { sign: "Cancer", start: [6, 21], end: [7, 22] },
  { sign: "Leo", start: [7, 23], end: [8, 22] },
  { sign: "Virgo", start: [8, 23], end: [9, 22] },
  { sign: "Libra", start: [9, 23], end: [10, 22] },
  { sign: "Scorpio", start: [10, 23], end: [11, 21] },
  { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
  { sign: "Capricorn", start: [12, 22], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  { sign: "Pisces", start: [2, 19], end: [3, 20] },
];

function getSunSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();

  for (const { sign, start, end } of SUN_SIGNS) {
    // Handle Capricorn wrapping around year
    if (sign === "Capricorn") {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return sign;
      }
    } else {
      if (
        (month === start[0] && day >= start[1]) ||
        (month === end[0] && day <= end[1])
      ) {
        return sign;
      }
    }
  }
  return "Unknown";
}

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getAgeGroup(age: number): string {
  if (age < 18) return "Under 18";
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  return "65+";
}

/**
 * GET /api/tracking/demographics
 *
 * Returns user demographics analysis:
 * - Age distribution (from birth_date)
 * - Sun sign distribution
 * - Behavior tier breakdown (Power/Regular/Light/Dormant)
 * - Feature preferences by tier
 */
export async function GET() {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all user profiles with birth data
    const { data: profiles } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, birth_date, created_at, payment_type, subscription_status");

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        totalUsers: 0,
        ageDistribution: [],
        sunSignDistribution: [],
        behaviorTiers: [],
        tierFeaturePreferences: {},
      });
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

    // Fetch session counts per user
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

    // Fetch last active dates
    const { data: lastEvents } = await supabaseAdmin
      .from("app_events")
      .select("user_id, created_at")
      .not("user_id", "is", null)
      .order("created_at", { ascending: false });

    const lastActiveMap = new Map<string, Date>();
    for (const event of lastEvents || []) {
      if (!lastActiveMap.has(event.user_id)) {
        lastActiveMap.set(event.user_id, new Date(event.created_at));
      }
    }

    // Fetch event categories per user for feature preferences
    const { data: userEvents } = await supabaseAdmin
      .from("app_events")
      .select("user_id, event_category")
      .not("user_id", "is", null);

    const userCategoryMap = new Map<string, Record<string, number>>();
    for (const event of userEvents || []) {
      if (!userCategoryMap.has(event.user_id)) {
        userCategoryMap.set(event.user_id, {});
      }
      const cats = userCategoryMap.get(event.user_id)!;
      cats[event.event_category] = (cats[event.event_category] || 0) + 1;
    }

    // Calculate demographics
    const ageGroups: Record<string, number> = {};
    const sunSigns: Record<string, number> = {};
    const behaviorTiers: Record<string, number> = {
      power: 0,
      regular: 0,
      light: 0,
      dormant: 0,
    };

    // Track feature preferences by tier
    const tierCategories: Record<string, Record<string, number>> = {
      power: {},
      regular: {},
      light: {},
      dormant: {},
    };

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const profile of profiles) {
      // Age distribution
      if (profile.birth_date) {
        const age = getAge(profile.birth_date);
        const ageGroup = getAgeGroup(age);
        ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;

        // Sun sign distribution
        const sunSign = getSunSign(profile.birth_date);
        sunSigns[sunSign] = (sunSigns[sunSign] || 0) + 1;
      }

      // Behavior tier calculation
      const chatCount = messageCountMap.get(profile.user_id) || 0;
      const sessionCount = sessionCountMap.get(profile.user_id)?.size || 0;
      const lastActive = lastActiveMap.get(profile.user_id);

      let tier: "power" | "regular" | "light" | "dormant";

      if (!lastActive || lastActive < sevenDaysAgo) {
        tier = "dormant";
      } else if (chatCount >= 20 && sessionCount >= 10) {
        tier = "power";
      } else if (chatCount >= 5 || sessionCount >= 5) {
        tier = "regular";
      } else {
        tier = "light";
      }

      behaviorTiers[tier]++;

      // Aggregate feature preferences by tier
      const userCats = userCategoryMap.get(profile.user_id) || {};
      for (const [cat, count] of Object.entries(userCats)) {
        tierCategories[tier][cat] = (tierCategories[tier][cat] || 0) + count;
      }
    }

    // Format age distribution
    const ageOrder = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
    const ageDistribution = ageOrder
      .filter((group) => ageGroups[group])
      .map((group) => ({
        group,
        count: ageGroups[group],
        percentage: Math.round((ageGroups[group] / profiles.length) * 100),
      }));

    // Format sun sign distribution
    const signOrder = SUN_SIGNS.map((s) => s.sign);
    const sunSignDistribution = signOrder
      .filter((sign) => sunSigns[sign])
      .map((sign) => ({
        sign,
        count: sunSigns[sign],
        percentage: Math.round((sunSigns[sign] / profiles.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Format behavior tiers
    const behaviorTierList = [
      { tier: "power", label: "Power Users", count: behaviorTiers.power, color: "#10B981" },
      { tier: "regular", label: "Regular", count: behaviorTiers.regular, color: "#3B82F6" },
      { tier: "light", label: "Light", count: behaviorTiers.light, color: "#F59E0B" },
      { tier: "dormant", label: "Dormant", count: behaviorTiers.dormant, color: "#6B7280" },
    ].map((t) => ({
      ...t,
      percentage: Math.round((t.count / profiles.length) * 100),
    }));

    // Format tier feature preferences (top categories per tier)
    const tierFeaturePreferences: Record<string, Array<{ category: string; count: number }>> = {};
    for (const [tier, cats] of Object.entries(tierCategories)) {
      tierFeaturePreferences[tier] = Object.entries(cats)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    return NextResponse.json({
      totalUsers: profiles.length,
      ageDistribution,
      sunSignDistribution,
      behaviorTiers: behaviorTierList,
      tierFeaturePreferences,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Demographics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch demographics data" },
      { status: 500 }
    );
  }
}
