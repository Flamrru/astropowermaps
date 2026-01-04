import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * Stella Chat History API
 *
 * GET /api/stella/history - Retrieve chat history
 * DELETE /api/stella/history - Clear chat history (start new conversation)
 */

// TODO: After release, decrease back to 50
const DAILY_MESSAGE_LIMIT = 200;

export async function GET() {
  try {
    // 1. Get user ID (bypass auth for testing)
    let userId: string;

    if (BYPASS_AUTH) {
      userId = TEST_USER_ID;
    } else {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
    }

    // 2. Get chat history (last 50 messages, excluding soft-deleted)
    const { data: messages, error: historyError } = await supabaseAdmin
      .from("stella_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(50);

    if (historyError) {
      console.error("History fetch error:", historyError);
      return NextResponse.json({ messages: [], remaining: DAILY_MESSAGE_LIMIT });
    }

    // 3. Calculate remaining messages for today
    const today = new Date().toISOString().split("T")[0];
    const { count: todayCount } = await supabaseAdmin
      .from("stella_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00Z`);

    const remaining = DAILY_MESSAGE_LIMIT - (todayCount || 0);

    // 4. Format messages for the frontend
    const formattedMessages = (messages || []).map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at,
    }));

    return NextResponse.json({
      messages: formattedMessages,
      remaining: Math.max(0, remaining),
    });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json(
      { messages: [], remaining: DAILY_MESSAGE_LIMIT },
      { status: 200 }
    );
  }
}

/**
 * Clear chat history - start a new conversation
 * Uses SOFT DELETE: messages are marked as deleted but preserved in database
 */
export async function DELETE() {
  try {
    // 1. Get user ID
    let userId: string;

    if (BYPASS_AUTH) {
      userId = TEST_USER_ID;
    } else {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
    }

    // 2. Soft delete: mark messages as deleted (preserves all data)
    const { error: deleteError } = await supabaseAdmin
      .from("stella_messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("deleted_at", null); // Only mark currently visible messages

    if (deleteError) {
      console.error("Soft delete error:", deleteError);
      return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear history error:", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
