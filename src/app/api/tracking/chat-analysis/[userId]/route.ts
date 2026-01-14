import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "tracking_session";

type ReviewStatus = "new" | "in_progress" | "resolved" | "snoozed";
type ActionType = "mark_read" | "mark_unread" | "set_status" | "toggle_flag" | "add_note";

interface UpdateRequest {
  action: ActionType;
  status?: ReviewStatus;
  note?: string;
}

/**
 * GET /api/tracking/chat-analysis/[userId]
 *
 * Get all flagged messages for a specific user (expanded view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await params;

    // Get all flagged messages for this user
    const { data: flaggedMessages } = await supabaseAdmin
      .from("chat_classifications")
      .select(`
        id,
        message_id,
        primary_topic,
        review_reason,
        classified_at,
        stella_messages!inner(content, created_at)
      `)
      .eq("user_id", userId)
      .eq("needs_review", true)
      .order("classified_at", { ascending: false });

    // Get review status
    const { data: review } = await supabaseAdmin
      .from("flagged_conversation_reviews")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get user email
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const userEmail = authData?.user?.email || "Unknown";

    const messages = (flaggedMessages || []).map((f) => {
      const stellaData = f.stella_messages as unknown;
      const message = Array.isArray(stellaData)
        ? (stellaData[0] as { content: string; created_at: string } | undefined)
        : (stellaData as { content: string; created_at: string } | null);

      return {
        id: f.id,
        message_id: f.message_id,
        content: message?.content || "",
        primary_topic: f.primary_topic,
        review_reason: f.review_reason,
        classified_at: f.classified_at,
        created_at: message?.created_at,
      };
    });

    return NextResponse.json({
      user_id: userId,
      user_email: userEmail,
      messages,
      review: review
        ? {
            status: review.status,
            manually_flagged: review.manually_flagged,
            admin_notes: review.admin_notes,
            last_read_at: review.last_read_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Chat analysis user GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tracking/chat-analysis/[userId]
 *
 * Update conversation review status:
 * - mark_read: Set last_read_at to now
 * - mark_unread: Clear last_read_at
 * - set_status: Change status (new, in_progress, resolved, snoozed)
 * - toggle_flag: Toggle manually_flagged
 * - add_note: Update admin_notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const body: UpdateRequest = await request.json();
    const { action, status, note } = body;

    // Build update object based on action
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    switch (action) {
      case "mark_read":
        updateData.last_read_at = new Date().toISOString();
        break;

      case "mark_unread":
        updateData.last_read_at = null;
        break;

      case "set_status":
        if (!status || !["new", "in_progress", "resolved", "snoozed"].includes(status)) {
          return NextResponse.json(
            { error: "Invalid status" },
            { status: 400 }
          );
        }
        updateData.status = status;
        break;

      case "toggle_flag":
        // Get current value first
        const { data: currentReview } = await supabaseAdmin
          .from("flagged_conversation_reviews")
          .select("manually_flagged")
          .eq("user_id", userId)
          .single();
        updateData.manually_flagged = !currentReview?.manually_flagged;
        break;

      case "add_note":
        updateData.admin_notes = note || null;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Upsert the review record
    const { data: updated, error } = await supabaseAdmin
      .from("flagged_conversation_reviews")
      .upsert(
        {
          user_id: userId,
          ...updateData,
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Review update error:", error);
      return NextResponse.json(
        { error: "Failed to update review" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: {
        user_id: userId,
        status: updated.status,
        manually_flagged: updated.manually_flagged,
        last_read_at: updated.last_read_at,
        admin_notes: updated.admin_notes,
      },
    });
  } catch (error) {
    console.error("Chat analysis user PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
