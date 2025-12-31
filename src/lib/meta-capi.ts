import crypto from "crypto";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const API_VERSION = "v18.0";

/**
 * Hash a string using SHA-256 (Meta requires hashed PII)
 */
function hashSHA256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

/**
 * Generate a unique event ID for deduplication with client-side pixel
 */
function generateEventId(): string {
  return `capi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface SendPurchaseEventParams {
  email: string;
  value: number;
  currency: string;
  eventId?: string; // Optional: pass from client for deduplication
}

/**
 * Send a Purchase event to Meta Conversion API
 *
 * This is called from the Stripe webhook after successful payment.
 * Errors are logged but don't throw - payment already succeeded.
 */
export async function sendPurchaseEvent({
  email,
  value,
  currency,
}: SendPurchaseEventParams): Promise<{ success: boolean; eventId: string }> {
  const eventId = generateEventId();

  // Check for required env vars
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error("Meta CAPI: Missing PIXEL_ID or ACCESS_TOKEN");
    return { success: false, eventId };
  }

  const endpoint = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

  const eventData = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        user_data: {
          em: hashSHA256(email), // Hashed email
        },
        custom_data: {
          value: value,
          currency: currency,
        },
      },
    ],
    access_token: ACCESS_TOKEN,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Meta CAPI error:", result);
      return { success: false, eventId };
    }

    console.log("Meta CAPI: Purchase event sent successfully", {
      eventId,
      email: email.substring(0, 3) + "***", // Log partial email for debugging
      value,
      currency,
      events_received: result.events_received,
    });

    return { success: true, eventId };
  } catch (error) {
    console.error("Meta CAPI: Failed to send event", error);
    return { success: false, eventId };
  }
}
