import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "tracking_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// In-memory store for rate limiting (resets on server restart)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

function isRateLimited(ip: string): { limited: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { limited: false };
  }

  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return { limited: false };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil(
      (RATE_LIMIT_WINDOW_MS - (now - record.firstAttempt)) / 1000
    );
    return { limited: true, retryAfterSeconds };
  }

  return { limited: false };
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * POST /api/tracking/auth - Login
 */
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  const { limited, retryAfterSeconds } = isRateLimited(clientIP);
  if (limited) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const { password } = await request.json();
    const trackingPassword = process.env.TRACKING_PASSWORD;

    if (!trackingPassword) {
      console.error("TRACKING_PASSWORD not configured");
      return NextResponse.json(
        { error: "Tracking not configured" },
        { status: 500 }
      );
    }

    if (password !== trackingPassword) {
      recordAttempt(clientIP);
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Successful login
    clearAttempts(clientIP);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tracking/auth - Logout
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}

/**
 * GET /api/tracking/auth - Check if authenticated
 */
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value === "authenticated") {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
