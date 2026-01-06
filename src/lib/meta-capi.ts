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

/**
 * Build user_data object for Meta CAPI
 * Only includes fields that have values (Meta ignores null/undefined)
 */
function buildUserData(params: {
  email: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}): Record<string, string> {
  const userData: Record<string, string> = {
    em: hashSHA256(params.email),
  };

  // Add optional fields only if they have values
  if (params.clientIpAddress) {
    userData.client_ip_address = params.clientIpAddress;
  }
  if (params.clientUserAgent) {
    userData.client_user_agent = params.clientUserAgent;
  }
  if (params.fbc) {
    userData.fbc = params.fbc;
  }
  if (params.fbp) {
    userData.fbp = params.fbp;
  }

  return userData;
}

// ============================================
// PURCHASE EVENT
// ============================================

interface SendPurchaseEventParams {
  email: string;
  value: number;
  currency: string;
  // Deduplication
  eventId?: string;           // Pass from client for deduplication
  // Enhanced user data (improves Meta match rate)
  clientIpAddress?: string;   // From request headers
  clientUserAgent?: string;   // From request headers
  fbc?: string;               // Facebook Click ID (from fbclid URL param or _fbc cookie)
  fbp?: string;               // Facebook Browser ID (from _fbp cookie)
  eventSourceUrl?: string;    // Page URL where event occurred
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
  eventId: externalEventId,
  clientIpAddress,
  clientUserAgent,
  fbc,
  fbp,
  eventSourceUrl,
}: SendPurchaseEventParams): Promise<{ success: boolean; eventId: string }> {
  // Use external ID if provided (for deduplication with client), otherwise generate
  const eventId = externalEventId || generateEventId();

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
        event_source_url: eventSourceUrl,
        user_data: buildUserData({ email, clientIpAddress, clientUserAgent, fbc, fbp }),
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
      hasDedupeId: Boolean(externalEventId),
      events_received: result.events_received,
    });

    return { success: true, eventId };
  } catch (error) {
    console.error("Meta CAPI: Failed to send Purchase event", error);
    return { success: false, eventId };
  }
}

// ============================================
// LEAD EVENT
// ============================================

interface SendLeadEventParams {
  email: string;
  // Deduplication
  eventId?: string;           // Pass from client for deduplication
  // Enhanced user data
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
  eventSourceUrl?: string;
}

/**
 * Send a Lead event to Meta Conversion API
 *
 * This is called from the /api/lead endpoint after saving email + birth data.
 * Uses same event ID as client-side pixel for deduplication.
 */
export async function sendLeadEvent({
  email,
  eventId: externalEventId,
  clientIpAddress,
  clientUserAgent,
  fbc,
  fbp,
  eventSourceUrl,
}: SendLeadEventParams): Promise<{ success: boolean; eventId: string }> {
  // Use external ID if provided (for deduplication with client), otherwise generate
  const eventId = externalEventId || generateEventId();

  // Check for required env vars
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error("Meta CAPI: Missing PIXEL_ID or ACCESS_TOKEN");
    return { success: false, eventId };
  }

  const endpoint = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

  const eventData = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: buildUserData({ email, clientIpAddress, clientUserAgent, fbc, fbp }),
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
      console.error("Meta CAPI Lead error:", result);
      return { success: false, eventId };
    }

    console.log("Meta CAPI: Lead event sent successfully", {
      eventId,
      email: email.substring(0, 3) + "***",
      hasDedupeId: Boolean(externalEventId),
      events_received: result.events_received,
    });

    return { success: true, eventId };
  } catch (error) {
    console.error("Meta CAPI: Failed to send Lead event", error);
    return { success: false, eventId };
  }
}
