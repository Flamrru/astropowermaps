import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/features/palm-reader/lib/openai-client";
import {
  detectPalmLinesWithRoboflow,
  convertRoboflowToLines,
  getMockPalmLines,
} from "@/features/palm-reader/lib/roboflow-client";
import type { PalmAnalysisResult, PalmBounds, DetectedLine } from "@/features/palm-reader/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, sessionId, palmBounds, handLandmarks, handedness } = body;

    // Validate input
    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Missing image data" },
        { status: 400 }
      );
    }

    console.log(`📍 Palm analysis started for session: ${sessionId?.substring(0, 8)}...`);
    console.log(`📐 Palm bounds received:`, palmBounds);
    console.log(`🖐️ Handedness:`, handedness || "unknown");

    // Step 1: Crop image to palm region if we have bounds
    let processedImage = imageBase64;
    let croppedWidth = 0;
    let croppedHeight = 0;

    if (palmBounds) {
      console.log("✂️ Cropping image to palm region...");
      const cropResult = await cropImageToPalmBounds(imageBase64, palmBounds);
      if (cropResult) {
        processedImage = cropResult.croppedImage;
        croppedWidth = cropResult.width;
        croppedHeight = cropResult.height;
        console.log(`✅ Cropped to ${croppedWidth}x${croppedHeight}`);
      }
    }

    // Step 2: Detect palm lines with Roboflow
    console.log("🔍 Calling Roboflow for line detection...");
    let detectedLines: DetectedLine[] = [];

    const roboflowResult = await detectPalmLinesWithRoboflow(processedImage);

    let usedRoboflow = false;

    if (roboflowResult.success && roboflowResult.predictions.length > 0) {
      // Convert Roboflow predictions to our format
      detectedLines = convertRoboflowToLines(
        roboflowResult.predictions,
        roboflowResult.imageSize.width || croppedWidth || 1280,
        roboflowResult.imageSize.height || croppedHeight || 720
      );
      usedRoboflow = true;
      console.log(`✅ Roboflow detected ${detectedLines.length} palm lines`);

      // Only transform Roboflow lines (they're in cropped space)
      if (palmBounds && detectedLines.length > 0) {
        detectedLines = transformLinesToOriginalSpace(detectedLines, palmBounds);
      }
    } else {
      // Fallback to anatomical lines based on MediaPipe landmarks
      // These are already in full-image normalized coordinates - NO transform needed
      console.log("⚠️ Using anatomical palm lines from MediaPipe landmarks");
      console.log(`📍 Hand landmarks available: ${handLandmarks?.length || 0} points`);
      detectedLines = getMockPalmLines(handLandmarks, palmBounds);
    }

    // Create the line detection result
    // Map MediaPipe handedness to our format (lowercase)
    const detectedHandType = handedness === "Left" ? "left" : handedness === "Right" ? "right" : "right";

    const lineDetectionResult = {
      success: true,
      lines: detectedLines,
      handType: detectedHandType as "left" | "right",
      imageQuality: "good" as const,
      // Include landmarks for debug visualization
      landmarks: handLandmarks?.map((lm: { x: number; y: number }) => ({ x: lm.x, y: lm.y })) || undefined,
    };

    console.log(`📷 Lines detected: ${lineDetectionResult.lines.length}`);

    // Step 3: Generate reading with OpenAI (text only, no coordinates)
    console.log("🔮 Calling OpenAI for reading generation...");
    const openaiResult = await generateReading(lineDetectionResult.lines);

    if (!openaiResult.success) {
      console.error("OpenAI reading failed:", openaiResult.error);
      // Still return partial success with line detection data
      return NextResponse.json({
        success: true,
        partial: true,
        data: {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          geminiResult: lineDetectionResult, // Keep key name for compatibility
          openaiResult,
        } as PalmAnalysisResult,
      });
    }

    console.log("✅ Palm reading generated successfully");

    // Return combined result
    const result: PalmAnalysisResult = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      imageBase64: "", // Don't return the image in response (too large)
      geminiResult: lineDetectionResult, // Keep key name for compatibility
      openaiResult,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Palm analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Crop image to palm bounding box
 * Uses a canvas-based approach that works in Node.js with edge runtime
 */
async function cropImageToPalmBounds(
  imageBase64: string,
  bounds: PalmBounds
): Promise<{ croppedImage: string; width: number; height: number } | null> {
  try {
    // For server-side cropping, we'll use a simple approach
    // Since we're in Edge runtime, we can't use canvas directly
    // Instead, we'll pass the bounds to Roboflow and let it handle the full image
    // The line coordinates will be relative to the full image

    // For now, return the original image and handle bounds in coordinate transformation
    console.log("📍 Using full image with bounds for coordinate mapping");

    // Extract image dimensions from base64 (approximate from data length)
    // This is a workaround - in production you'd decode and get actual dimensions
    return null; // Let Roboflow handle the full image
  } catch (error) {
    console.error("Crop error:", error);
    return null;
  }
}

/**
 * Transform line coordinates from cropped palm space back to original image space
 */
function transformLinesToOriginalSpace(
  lines: DetectedLine[],
  palmBounds: PalmBounds
): DetectedLine[] {
  return lines.map(line => {
    if (!line.points) return line;

    // Transform each point from [0,1] in palm space to [0,1] in image space
    const transformedPoints = line.points.map(([x, y]): [number, number] => {
      // Point in palm space (0-1) -> point in image space (0-1)
      const imageX = palmBounds.x + x * palmBounds.width;
      const imageY = palmBounds.y + y * palmBounds.height;
      return [imageX, imageY];
    });

    return {
      ...line,
      points: transformedPoints,
    };
  });
}
