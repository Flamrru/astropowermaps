import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Create Account API
 *
 * Creates a Supabase auth user with email + password after payment.
 * If user already exists (from webhook), updates their password.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, sessionId } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
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

      // Update profile status to active
      await supabaseAdmin
        .from("user_profiles")
        .update({
          account_status: "active",
          setup_completed_at: new Date().toISOString(),
        })
        .eq("user_id", existingUser.id);

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

      // If we have a sessionId, try to get birth data from lead
      if (sessionId) {
        const { data: lead } = await supabaseAdmin
          .from("astro_leads")
          .select("*")
          .eq("session_id", sessionId)
          .single();

        if (lead && lead.birth_date) {
          // Create profile with birth data
          await supabaseAdmin.from("user_profiles").insert({
            user_id: newUser.user.id,
            account_status: "active",
            setup_completed_at: new Date().toISOString(),
            birth_date: lead.birth_date,
            birth_time: lead.birth_time || null,
            birth_time_unknown: lead.birth_time_unknown || false,
            birth_place: lead.birth_location_name,
            birth_lat: lead.birth_location_lat,
            birth_lng: lead.birth_location_lng,
            birth_timezone: lead.birth_location_timezone,
          });
        }
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
