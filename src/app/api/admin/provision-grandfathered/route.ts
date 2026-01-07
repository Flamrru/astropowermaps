import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendGrandfatheredInviteEmail } from "@/lib/resend";

const COOKIE_NAME = "admin_session";

/**
 * Provision Grandfathered User API
 *
 * Sends invite email to users who made one-time purchases before subscriptions.
 * They get free Stella+ access.
 *
 * Request body:
 * - email: string (required)
 * - sendEmail: boolean (default: false - set true when ready to send invites)
 *
 * What it does:
 * 1. Verifies birth data exists in astro_leads table
 * 2. Sends styled invite email with setup link (no magic link needed)
 *
 * The user creates their account when they click the link and set a password.
 */
export async function POST(request: NextRequest) {
  // Admin authentication check
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, sendEmail = false, baseUrl: customBaseUrl } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify birth data exists in astro_leads
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("astro_leads")
      .select("email, birth_date, birth_time, birth_location_name")
      .ilike("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (leadError || !lead) {
      console.error(`No lead found for ${normalizedEmail}:`, leadError);
      return NextResponse.json(
        { error: "No lead data found for this email" },
        { status: 404 }
      );
    }

    if (!lead.birth_date) {
      return NextResponse.json(
        { error: "No birth data found for this email" },
        { status: 400 }
      );
    }

    // 2. Build simple setup URL (no magic link needed)
    // Allow custom baseUrl for testing on preview deployments
    const baseUrl = customBaseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://www.astropowermap.com";
    const setupUrl = `${baseUrl}/setup?type=grandfathered&email=${encodeURIComponent(normalizedEmail)}`;

    console.log(`Setup URL for ${normalizedEmail.substring(0, 3)}***: ${setupUrl}`);

    // 3. Optionally send email
    let emailSent = false;
    if (sendEmail) {
      const emailResult = await sendGrandfatheredInviteEmail({
        email: normalizedEmail,
        setupUrl,
      });
      emailSent = emailResult.success;

      if (!emailResult.success) {
        console.error(`Failed to send email to ${normalizedEmail}:`, emailResult.error);
      } else {
        console.log(`Email sent to ${normalizedEmail.substring(0, 3)}***`);
      }
    }

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      setupUrl,
      emailSent,
      birthData: {
        date: lead.birth_date,
        time: lead.birth_time,
        location: lead.birth_location_name,
      },
    });
  } catch (error) {
    console.error("Provision grandfathered error:", error);
    return NextResponse.json(
      { error: "Failed to provision grandfathered user" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to test/preview a single user's data
 */
export async function GET(request: NextRequest) {
  // Admin authentication check
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email param required" }, { status: 400 });
  }

  const { data: lead } = await supabaseAdmin
    .from("astro_leads")
    .select("email, birth_date, birth_time, birth_location_name, birth_location_lat, birth_location_lng, birth_location_timezone")
    .ilike("email", email.toLowerCase())
    .single();

  if (!lead) {
    return NextResponse.json({ error: "No lead found" }, { status: 404 });
  }

  // Check if already provisioned
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  const { data: profile } = existingUser
    ? await supabaseAdmin
        .from("user_profiles")
        .select("subscription_status, account_status")
        .eq("user_id", existingUser.id)
        .single()
    : { data: null };

  return NextResponse.json({
    lead,
    alreadyProvisioned: !!existingUser,
    profile: profile || null,
  });
}
