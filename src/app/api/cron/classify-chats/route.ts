import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  classifyMessagesBatch,
  type ClassificationResult,
} from "@/lib/chat-classification";

const BATCH_SIZE = 10;
const MAX_MESSAGES_PER_RUN = 200; // Limit per daily run to control costs

/**
 * GET /api/cron/classify-chats
 *
 * Daily cron job to classify new Stella messages.
 * Vercel Cron calls this endpoint at 6 AM UTC daily.
 *
 * Security: Vercel automatically adds authorization header for cron jobs.
 */
export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request from Vercel
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development or if CRON_SECRET not set, allow the request
    if (process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  console.log("[Cron] Starting daily chat classification job");

  try {
    // Check if a job is already running
    const { data: runningJob } = await supabaseAdmin
      .from("chat_analysis_jobs")
      .select("id")
      .eq("status", "running")
      .single();

    if (runningJob) {
      console.log("[Cron] Job already running, skipping");
      return NextResponse.json({
        status: "skipped",
        reason: "Job already running",
      });
    }

    // Get all classified message IDs
    const { data: classifiedData } = await supabaseAdmin
      .from("chat_classifications")
      .select("message_id");

    const classifiedIds = new Set((classifiedData || []).map((c) => c.message_id));

    // Get unclassified user messages
    const { data: allMessages } = await supabaseAdmin
      .from("stella_messages")
      .select("id, user_id, content, created_at")
      .eq("role", "user")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(MAX_MESSAGES_PER_RUN * 2); // Fetch more to filter

    const toClassify = (allMessages || [])
      .filter((m) => !classifiedIds.has(m.id))
      .slice(0, MAX_MESSAGES_PER_RUN);

    if (toClassify.length === 0) {
      console.log("[Cron] No new messages to classify");
      return NextResponse.json({
        status: "completed",
        message: "No new messages to classify",
        messagesClassified: 0,
      });
    }

    console.log(`[Cron] Found ${toClassify.length} messages to classify`);

    // Create job record
    const { data: job, error: jobError } = await supabaseAdmin
      .from("chat_analysis_jobs")
      .insert({
        job_type: "daily",
        status: "running",
        messages_analyzed: toClassify.length,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error("[Cron] Failed to create job record:", jobError);
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
          const result = results.get(m.id) as ClassificationResult | undefined;
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
          console.error("[Cron] Batch insert error:", insertError);
          errors += batch.length;
        } else {
          classified += batch.length;
        }

        console.log(`[Cron] Progress: ${classified}/${toClassify.length} classified`);
      } catch (batchError) {
        console.error("[Cron] Batch classification error:", batchError);
        errors += batch.length;
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < toClassify.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
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

    console.log(`[Cron] Job completed: ${classified} classified, ${errors} errors`);

    return NextResponse.json({
      status: "completed",
      jobId: job.id,
      messagesAnalyzed: toClassify.length,
      messagesClassified: classified,
      errors,
    });
  } catch (error) {
    console.error("[Cron] Fatal error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
