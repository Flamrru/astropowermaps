import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Stella Chat History API
 *
 * Retrieves the user's recent chat history with Stella.
 * Also returns remaining message count for the day.
 *
 * GET /api/stella/history
 */

const DAILY_MESSAGE_LIMIT = 50;

export async function GET() {
  try {
    // 1. Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get chat history (last 50 messages)
    const { data: messages, error: historyError } = await supabaseAdmin
      .from("stella_messages")
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
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
      .eq("user_id", user.id)
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
