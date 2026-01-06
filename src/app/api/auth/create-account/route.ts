import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Create Account API
 *
 * Creates a Supabase auth user with email + password.
 * Works for:
 * 1. New subscribers (after payment) - subscription_status = 'active'
 * 2. Grandfathered users (from invite email) - subscription_status = 'grandfathered'
 *
 * If user already exists (from webhook), updates their password.
 * Also sets display name on the user profile.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, sessionId, isGrandfathered } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists (created by webhook)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      // User exists - update their password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password }
      );

      if (updateError) {
        console.error("Failed to update password:", updateError);
        return NextResponse.json(
          { error: "Failed to set password" },
          { status: 500 }
        );
      }

      // Check if profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("user_id", existingUser.id)
        .single();

      // Determine subscription status
      const subscriptionStatus = isGrandfathered ? "grandfathered" : "active";

      if (existingProfile) {
        // Update existing profile
        const { error: profileError } = await supabaseAdmin
          .from("user_profiles")
          .update({
            display_name: displayName || null,
            account_status: "active",
            subscription_status: subscriptionStatus,
            setup_completed_at: new Date().toISOString(),
          })
          .eq("user_id", existingUser.id);

        if (profileError) {
          console.error("Failed to update profile:", profileError);
        } else {
          console.log(`Profile updated (${subscriptionStatus}) for ${email.substring(0, 3)}***`);
        }
      } else {
        // Profile doesn't exist - create it from lead data
        console.log(`No profile found for ${email.substring(0, 3)}***, creating from lead...`);

        // Try to get birth data from lead using email
        // For grandfathered users, don't require has_purchased (old one-time purchases)
        const leadQuery = supabaseAdmin
          .from("astro_leads")
          .select("*")
          .ilike("email", email)
          .order("created_at", { ascending: false })
          .limit(1);

        // Only filter by has_purchased for new subscribers
        if (!isGrandfathered) {
          leadQuery.eq("has_purchased", true);
        }

        const { data: lead } = await leadQuery.single();

        if (lead && lead.birth_date) {
          const { error: insertError } = await supabaseAdmin.from("user_profiles").insert({
            user_id: existingUser.id,
            display_name: displayName || null,
            account_status: "active",
            subscription_status: subscriptionStatus,
            setup_completed_at: new Date().toISOString(),
            birth_date: lead.birth_date,
            birth_time: lead.birth_time || null,
            birth_time_unknown: lead.birth_time_unknown || false,
            birth_place: lead.birth_location_name,
            birth_lat: lead.birth_location_lat,
            birth_lng: lead.birth_location_lng,
            birth_timezone: lead.birth_location_timezone,
          });

          if (insertError) {
            console.error("Failed to create profile:", insertError);
          } else {
            console.log(`Profile created (${subscriptionStatus}) for ${email.substring(0, 3)}***`);
          }
        } else {
          console.error(`No lead with birth data found for ${email.substring(0, 3)}***`);
          return NextResponse.json(
            { error: "No birth data found for this email. Please contact support." },
            { status: 400 }
          );
        }
      }

      console.log(`Password set for existing user: ${email.substring(0, 3)}***`);
    } else {
      // Create new user with password
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email verification - they paid!
      });

      if (createError || !newUser.user) {
        console.error("Failed to create user:", createError);
        return NextResponse.json(
          { error: "Failed to create account" },
          { status: 500 }
        );
      }

      // Get birth data from lead
      // For grandfathered users: look up by email
      // For new subscribers: look up by sessionId
      let lead = null;

      if (isGrandfathered) {
        // Grandfathered user - look up by email
        const { data } = await supabaseAdmin
          .from("astro_leads")
          .select("*")
          .ilike("email", email)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        lead = data;
      } else if (sessionId) {
        // New subscriber - look up by session ID
        const { data } = await supabaseAdmin
          .from("astro_leads")
          .select("*")
          .eq("session_id", sessionId)
          .single();
        lead = data;
      }

      if (lead && lead.birth_date) {
        const subscriptionStatus = isGrandfathered ? "grandfathered" : "active";

        // Create profile with birth data and display name
        const { error: insertError } = await supabaseAdmin.from("user_profiles").insert({
          user_id: newUser.user.id,
          display_name: displayName || null,
          account_status: "active",
          subscription_status: subscriptionStatus,
          setup_completed_at: new Date().toISOString(),
          birth_date: lead.birth_date,
          birth_time: lead.birth_time || null,
          birth_time_unknown: lead.birth_time_unknown || false,
          birth_place: lead.birth_location_name,
          birth_lat: lead.birth_location_lat,
          birth_lng: lead.birth_location_lng,
          birth_timezone: lead.birth_location_timezone,
        });

        if (insertError) {
          console.error("Failed to create profile:", insertError);
        } else {
          console.log(`Profile created (${subscriptionStatus}) for ${email.substring(0, 3)}***`);
        }
      } else if (isGrandfathered) {
        // Grandfathered user MUST have birth data
        console.error(`No lead with birth data found for grandfathered user ${email.substring(0, 3)}***`);
        return NextResponse.json(
          { error: "No birth data found for this email. Please contact support." },
          { status: 400 }
        );
      }

      console.log(`Created new user with password: ${email.substring(0, 3)}***`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
