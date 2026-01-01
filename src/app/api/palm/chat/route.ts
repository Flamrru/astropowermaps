import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/features/palm-reader/lib/openai-client";
import type { PalmReading } from "@/features/palm-reader/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, readingContext } = body as {
      message: string;
      readingContext: PalmReading;
    };

    // Validate input
    if (!message || !readingContext) {
      return NextResponse.json(
        { success: false, error: "Missing message or reading context" },
        { status: 400 }
      );
    }

    console.log(`💬 Chat request: "${message.substring(0, 50)}..."`);

    // Generate response from Stella
    const result = await generateChatResponse(message, readingContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to generate response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response: result.response,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Chat failed",
      },
      { status: 500 }
    );
  }
}
