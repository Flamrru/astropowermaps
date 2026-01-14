import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  classifyMessagesBatch,
  CLASSIFICATION_TOPICS,
  PAIN_POINT_CATEGORIES,
  type ClassificationTopic,
  type PainPointCategory,
} from "@/lib/chat-classification";

const COOKIE_NAME = "tracking_session";
const BATCH_SIZE = 10; // Messages per AI call

/**
 * GET /api/tracking/chat-analysis
 *
 * Returns classification summary data for the dashboard:
 * - Topic breakdown
 * - Flagged messages for review
 * - Pain point insights
 * - Last job status
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
    const topicFilter = searchParams.get("topic") as ClassificationTopic | null;
    const needsReviewFilter = searchParams.get("needs_review");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    // Get total counts by topic
    const { data: topicCounts } = await supabaseAdmin
      .from("chat_classifications")
      .select("primary_topic");

    const byTopic: Record<string, number> = {};
    let totalClassified = 0;

    for (const row of topicCounts || []) {
      byTopic[row.primary_topic] = (byTopic[row.primary_topic] || 0) + 1;
      totalClassified++;
    }

    // Add labels and colors to topic breakdown
    const topicBreakdown = Object.entries(byTopic)
      .map(([topic, count]) => {
        const info = CLASSIFICATION_TOPICS[topic as ClassificationTopic] || CLASSIFICATION_TOPICS.general;
        return {
          topic,
          count,
          percentage: totalClassified > 0 ? Math.round((count / totalClassified) * 100) : 0,
          label: info.label,
          color: info.color,
          flagged: "flagged" in info && info.flagged,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Get flagged messages count
    const { count: flaggedCount } = await supabaseAdmin
      .from("chat_classifications")
      .select("id", { count: "exact" })
      .eq("needs_review", true);

    // ============================================
    // Grouped Conversations (new inbox-style)
    // ============================================

    // Get all flagged classifications with message content
    const { data: allFlaggedRaw } = await supabaseAdmin
      .from("chat_classifications")
      .select(`
        id,
        message_id,
        user_id,
        primary_topic,
        review_reason,
        classified_at,
        stella_messages!inner(content, created_at)
      `)
      .eq("needs_review", true)
      .order("classified_at", { ascending: false });

    // Get review status for all users
    const { data: reviewsData } = await supabaseAdmin
      .from("flagged_conversation_reviews")
      .select("*");

    const reviewsMap = new Map<string, {
      last_read_at: string | null;
      status: string;
      manually_flagged: boolean;
      admin_notes: string | null;
    }>();

    for (const review of reviewsData || []) {
      reviewsMap.set(review.user_id, {
        last_read_at: review.last_read_at,
        status: review.status,
        manually_flagged: review.manually_flagged,
        admin_notes: review.admin_notes,
      });
    }

    // Get user emails for all flagged users
    const allUserIds = [...new Set((allFlaggedRaw || []).map((f) => f.user_id))];
    const emailMap = new Map<string, string>();

    if (allUserIds.length > 0) {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      for (const user of authData?.users || []) {
        if (allUserIds.includes(user.id)) {
          emailMap.set(user.id, user.email || "Unknown");
        }
      }
    }

    // Group flagged messages by user
    const userGroups = new Map<string, Array<{
      id: string;
      message_id: string;
      primary_topic: string;
      review_reason: string | null;
      classified_at: string;
      content: string;
      created_at: string;
    }>>();

    for (const f of allFlaggedRaw || []) {
      const stellaData = f.stella_messages as unknown;
      const message = Array.isArray(stellaData)
        ? (stellaData[0] as { content: string; created_at: string } | undefined)
        : (stellaData as { content: string; created_at: string } | null);

      if (!userGroups.has(f.user_id)) {
        userGroups.set(f.user_id, []);
      }
      userGroups.get(f.user_id)!.push({
        id: f.id,
        message_id: f.message_id,
        primary_topic: f.primary_topic,
        review_reason: f.review_reason,
        classified_at: f.classified_at,
        content: message?.content || "",
        created_at: message?.created_at || f.classified_at,
      });
    }

    // Build grouped conversations
    const flaggedConversations = Array.from(userGroups.entries()).map(([userId, messages]) => {
      const review = reviewsMap.get(userId);
      const lastReadAt = review?.last_read_at ? new Date(review.last_read_at) : null;

      // Calculate unread count (messages classified after last read)
      const unreadCount = lastReadAt
        ? messages.filter((m) => new Date(m.classified_at) > lastReadAt).length
        : messages.length;

      // Get unique topics
      const topics = [...new Set(messages.map((m) => m.primary_topic))];

      // Latest message (first in array since sorted desc)
      const latestMsg = messages[0];

      return {
        user_id: userId,
        user_email: emailMap.get(userId) || "Unknown",
        total_flagged: messages.length,
        unread_count: unreadCount,
        status: review?.status || "new",
        manually_flagged: review?.manually_flagged || false,
        is_unread: unreadCount > 0 || !lastReadAt,
        admin_notes: review?.admin_notes || null,
        latest_message: {
          content_preview: latestMsg.content.substring(0, 150) + (latestMsg.content.length > 150 ? "..." : ""),
          primary_topic: latestMsg.primary_topic,
          topic_label: CLASSIFICATION_TOPICS[latestMsg.primary_topic as ClassificationTopic]?.label || latestMsg.primary_topic,
          review_reason: latestMsg.review_reason,
          created_at: latestMsg.created_at,
        },
        topics,
        last_flagged_at: latestMsg.classified_at,
        last_read_at: review?.last_read_at || null,
        // Include all messages for expanded view
        messages: messages.map((m) => ({
          id: m.id,
          message_id: m.message_id,
          content_preview: m.content.substring(0, 300) + (m.content.length > 300 ? "..." : ""),
          primary_topic: m.primary_topic,
          topic_label: CLASSIFICATION_TOPICS[m.primary_topic as ClassificationTopic]?.label || m.primary_topic,
          review_reason: m.review_reason,
          created_at: m.created_at,
        })),
      };
    })
      // Sort: unread first, then by last flagged date
      .sort((a, b) => {
        if (a.is_unread !== b.is_unread) return a.is_unread ? -1 : 1;
        return new Date(b.last_flagged_at).getTime() - new Date(a.last_flagged_at).getTime();
      });

    // Filter by topic if specified
    const filteredConversations = topicFilter
      ? flaggedConversations.filter((c) => c.topics.includes(topicFilter))
      : flaggedConversations;

    // Calculate unread totals
    const totalUnread = flaggedConversations.filter((c) => c.is_unread).length;
    const totalInProgress = flaggedConversations.filter((c) => c.status === "in_progress").length;

    // Legacy flaggedMessages format (for backward compatibility)
    const flaggedMessages = (allFlaggedRaw || []).slice(0, limit).map((f) => {
      const stellaData = f.stella_messages as unknown;
      const message = Array.isArray(stellaData)
        ? (stellaData[0] as { content: string; created_at: string } | undefined)
        : (stellaData as { content: string; created_at: string } | null);
      return {
        id: f.id,
        message_id: f.message_id,
        user_id: f.user_id,
        user_email: emailMap.get(f.user_id) || "Unknown",
        content_preview: message?.content?.substring(0, 150) + (message?.content && message.content.length > 150 ? "..." : "") || "",
        primary_topic: f.primary_topic,
        topic_label: CLASSIFICATION_TOPICS[f.primary_topic as ClassificationTopic]?.label || f.primary_topic,
        review_reason: f.review_reason,
        classified_at: f.classified_at,
        message_created_at: message?.created_at,
      };
    });

    // Get pain point breakdown
    const { data: painPointData } = await supabaseAdmin
      .from("chat_classifications")
      .select("pain_point_category, pain_point")
      .not("pain_point_category", "is", null);

    const painPointCounts: Record<string, { count: number; examples: string[] }> = {};
    let totalPainPoints = 0;

    for (const row of painPointData || []) {
      const cat = row.pain_point_category as PainPointCategory;
      if (!painPointCounts[cat]) {
        painPointCounts[cat] = { count: 0, examples: [] };
      }
      painPointCounts[cat].count++;
      totalPainPoints++;

      // Keep up to 3 examples per category
      if (row.pain_point && painPointCounts[cat].examples.length < 3) {
        painPointCounts[cat].examples.push(row.pain_point);
      }
    }

    const painPoints = Object.entries(painPointCounts)
      .map(([category, data]) => {
        const info = PAIN_POINT_CATEGORIES[category as PainPointCategory];
        return {
          category,
          label: info?.label || category,
          topic: info?.topic || "general",
          count: data.count,
          percentage: totalPainPoints > 0 ? Math.round((data.count / totalPainPoints) * 100) : 0,
          examples: data.examples,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Get last job status
    const { data: lastJob } = await supabaseAdmin
      .from("chat_analysis_jobs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    // Get unclassified count
    const { count: unclassifiedCount } = await supabaseAdmin
      .from("stella_messages")
      .select("id", { count: "exact" })
      .eq("role", "user")
      .is("deleted_at", null)
      .not("id", "in", `(SELECT message_id FROM chat_classifications)`);

    // Alternate approach for unclassified count (subquery may not work)
    const { data: allUserMessages } = await supabaseAdmin
      .from("stella_messages")
      .select("id", { count: "exact" })
      .eq("role", "user")
      .is("deleted_at", null);

    const { data: classifiedMessages } = await supabaseAdmin
      .from("chat_classifications")
      .select("message_id");

    const classifiedIds = new Set((classifiedMessages || []).map((c) => c.message_id));
    const actualUnclassified = (allUserMessages || []).filter((m) => !classifiedIds.has(m.id)).length;

    return NextResponse.json({
      summary: {
        totalClassified,
        totalUnclassified: actualUnclassified,
        flaggedForReview: flaggedCount || 0,
        totalPainPoints,
        // New inbox stats
        totalUnread,
        totalInProgress,
        totalConversations: flaggedConversations.length,
      },
      topicBreakdown,
      flaggedMessages, // Legacy format
      flaggedConversations: filteredConversations, // New grouped format
      painPoints,
      lastJob: lastJob
        ? {
            id: lastJob.id,
            type: lastJob.job_type,
            status: lastJob.status,
            startedAt: lastJob.started_at,
            completedAt: lastJob.completed_at,
            messagesAnalyzed: lastJob.messages_analyzed,
            messagesClassified: lastJob.messages_classified,
            errors: lastJob.errors,
          }
        : null,
    });
  } catch (error) {
    console.error("Chat analysis GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat analysis data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tracking/chat-analysis
 *
 * Triggers on-demand classification of unclassified messages.
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if a job is already running
    const { data: runningJob } = await supabaseAdmin
      .from("chat_analysis_jobs")
      .select("id")
      .eq("status", "running")
      .single();

    if (runningJob) {
      return NextResponse.json({
        status: "already_running",
        jobId: runningJob.id,
        message: "An analysis job is already running",
      });
    }

    // Get all classified message IDs
    const { data: classifiedData } = await supabaseAdmin
      .from("chat_classifications")
      .select("message_id");

    const classifiedIds = new Set((classifiedData || []).map((c) => c.message_id));

    // Get unclassified user messages
    const { data: unclassifiedMessages } = await supabaseAdmin
      .from("stella_messages")
      .select("id, user_id, content, created_at")
      .eq("role", "user")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500); // Process up to 500 messages per run

    const toClassify = (unclassifiedMessages || []).filter(
      (m) => !classifiedIds.has(m.id)
    );

    if (toClassify.length === 0) {
      return NextResponse.json({
        status: "completed",
        message: "No new messages to classify",
        messagesClassified: 0,
      });
    }

    // Create job record
    const { data: job, error: jobError } = await supabaseAdmin
      .from("chat_analysis_jobs")
      .insert({
        job_type: "manual",
        status: "running",
        messages_analyzed: toClassify.length,
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error("Failed to create job record");
    }

    // Process in batches
    let classified = 0;
    let errors = 0;

    for (let i = 0; i < toClassify.length; i += BATCH_SIZE) {
      const batch = toClassify.slice(i, i + BATCH_SIZE);

      try {
        // Classify batch
        const results = await classifyMessagesBatch(
          batch.map((m) => ({ id: m.id, content: m.content }))
        );

        // Insert classifications
        const insertData = batch.map((m) => {
          const result = results.get(m.id);
          return {
            message_id: m.id,
            user_id: m.user_id,
            primary_topic: result?.primary_topic || "general",
            secondary_topics: result?.secondary_topics || [],
            confidence: result?.confidence || 0.5,
            needs_review: result?.needs_review || false,
            review_reason: result?.review_reason || null,
            pain_point: result?.pain_point || null,
            pain_point_category: result?.pain_point_category || null,
          };
        });

        const { error: insertError } = await supabaseAdmin
          .from("chat_classifications")
          .insert(insertData);

        if (insertError) {
          console.error("Batch insert error:", insertError);
          errors += batch.length;
        } else {
          classified += batch.length;

          // Sync flagged_conversation_reviews for newly flagged messages
          const flaggedInBatch = insertData.filter((d) => d.needs_review);
          if (flaggedInBatch.length > 0) {
            const flaggedUserIds = [...new Set(flaggedInBatch.map((d) => d.user_id))];
            for (const userId of flaggedUserIds) {
              // Upsert review record - this marks conversation as unread if new flags after read
              await supabaseAdmin
                .from("flagged_conversation_reviews")
                .upsert(
                  {
                    user_id: userId,
                    last_flagged_message_at: new Date().toISOString(),
                    status: "new",
                    updated_at: new Date().toISOString(),
                  },
                  {
                    onConflict: "user_id",
                    ignoreDuplicates: false,
                  }
                );
            }
          }
        }
      } catch (batchError) {
        console.error("Batch classification error:", batchError);
        errors += batch.length;
      }

      // Update job progress periodically
      if (i % (BATCH_SIZE * 5) === 0) {
        await supabaseAdmin
          .from("chat_analysis_jobs")
          .update({
            messages_classified: classified,
            errors,
          })
          .eq("id", job.id);
      }
    }

    // Mark job as completed
    await supabaseAdmin
      .from("chat_analysis_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        messages_classified: classified,
        errors,
      })
      .eq("id", job.id);

    return NextResponse.json({
      status: "completed",
      jobId: job.id,
      messagesAnalyzed: toClassify.length,
      messagesClassified: classified,
      errors,
    });
  } catch (error) {
    console.error("Chat analysis POST error:", error);
    return NextResponse.json(
      { error: "Failed to run chat analysis" },
      { status: 500 }
    );
  }
}
