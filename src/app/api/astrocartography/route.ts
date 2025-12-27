import { NextRequest, NextResponse } from "next/server";
import { calculateAstrocartography } from "@/lib/astro/calculations";
import { BirthData, AstrocartographyResponse } from "@/lib/astro/types";

/**
 * POST /api/astrocartography
 *
 * Calculates astrocartography lines for the given birth data.
 * Returns planetary positions and line coordinates for map rendering.
 */
export async function POST(request: NextRequest): Promise<NextResponse<AstrocartographyResponse>> {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.birthData) {
      return NextResponse.json(
        { success: false, error: "Birth data is required" },
        { status: 400 }
      );
    }

    const birthData: BirthData = body.birthData;

    // Validate date format (YYYY-MM-DD)
    if (!birthData.date || !/^\d{4}-\d{2}-\d{2}$/.test(birthData.date)) {
      return NextResponse.json(
        { success: false, error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    if (!birthData.time || !/^\d{2}:\d{2}$/.test(birthData.time)) {
      return NextResponse.json(
        { success: false, error: "Invalid time format. Use HH:MM (24-hour)." },
        { status: 400 }
      );
    }

    // Validate location
    if (
      !birthData.location ||
      typeof birthData.location.lat !== "number" ||
      typeof birthData.location.lng !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid location. Latitude and longitude are required." },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (birthData.location.lat < -90 || birthData.location.lat > 90) {
      return NextResponse.json(
        { success: false, error: "Latitude must be between -90 and 90." },
        { status: 400 }
      );
    }

    if (birthData.location.lng < -180 || birthData.location.lng > 180) {
      return NextResponse.json(
        { success: false, error: "Longitude must be between -180 and 180." },
        { status: 400 }
      );
    }

    // Set default time if unknown
    if (birthData.timeUnknown) {
      birthData.time = "12:00"; // Noon is the standard default in astrology
    }

    // Perform the calculation
    const result = calculateAstrocartography(birthData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Astrocartography calculation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate astrocartography. Please try again.",
      },
      { status: 500 }
    );
  }
}
