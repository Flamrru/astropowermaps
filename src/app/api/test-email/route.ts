import { NextRequest, NextResponse } from "next/server";
import { sendConfirmationEmail } from "@/lib/resend";

/**
 * TEST ENDPOINT - Remove after testing!
 * Tests email sending via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const { email, sessionId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Use provided sessionId or generate a test one
    const finalSessionId = sessionId || "test-" + Date.now();
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://astropowermaps.com";

    console.log("Testing email send to:", email);
    console.log("RESEND_API_KEY set:", !!process.env.RESEND_API_KEY);

    const result = await sendConfirmationEmail({
      email,
      sessionId: finalSessionId,
      baseUrl,
    });

    console.log("Email result:", result);

    return NextResponse.json({
      success: result.success,
      error: result.error,
      debug: {
        resendKeySet: !!process.env.RESEND_API_KEY,
        baseUrl,
        sessionId: finalSessionId,
      },
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
