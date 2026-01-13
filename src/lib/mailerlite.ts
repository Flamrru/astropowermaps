/**
 * MailerLite integration for email marketing automation
 *
 * Handles:
 * - Adding new leads to "Leads" group after quiz completion
 * - Moving subscribers to "Customers" group after purchase
 * - Custom fields: map_url, birth_location, quiz_interest, utm_source
 */

const API_BASE = "https://connect.mailerlite.com/api";

// Environment variables (add to .env.local)
// MAILERLITE_API_KEY - Your MailerLite API token
// MAILERLITE_LEADS_GROUP_ID - Group ID for active leads
// MAILERLITE_CUSTOMERS_GROUP_ID - Group ID for customers

function getConfig() {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const leadsGroupId = process.env.MAILERLITE_LEADS_GROUP_ID;
  const customersGroupId = process.env.MAILERLITE_CUSTOMERS_GROUP_ID;

  if (!apiKey) {
    console.warn("MAILERLITE_API_KEY is not configured - MailerLite integration disabled");
    return null;
  }

  return { apiKey, leadsGroupId, customersGroupId };
}

interface AddToLeadsParams {
  email: string;
  mapUrl: string;        // Full price link (&offer=full)
  mapUrlWin: string;     // Winback link (&offer=win)
  birthLocation?: string;
  quizInterest?: string;
  utmSource?: string | null;
}

interface MailerLiteResult {
  success: boolean;
  error?: string;
  subscriberId?: string;
}

/**
 * Add a new subscriber to the Leads group
 * Called after quiz completion
 */
export async function addSubscriberToLeads({
  email,
  mapUrl,
  mapUrlWin,
  birthLocation,
  quizInterest,
  utmSource,
}: AddToLeadsParams): Promise<MailerLiteResult> {
  const config = getConfig();

  if (!config) {
    return { success: false, error: "MailerLite not configured" };
  }

  if (!config.leadsGroupId) {
    console.warn("MAILERLITE_LEADS_GROUP_ID not set - skipping lead sync");
    return { success: false, error: "Leads group not configured" };
  }

  try {
    const response = await fetch(`${API_BASE}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        email,
        fields: {
          map_url: mapUrl,
          map_url_win: mapUrlWin,
          birth_location: birthLocation || "",
          quiz_interest: quizInterest || "",
          utm_source: utmSource || "direct",
        },
        groups: [config.leadsGroupId],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("MailerLite addSubscriber error:", data);
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    console.log(`✅ MailerLite: Added ${email.substring(0, 3)}*** to Leads group`);
    return { success: true, subscriberId: data.data?.id };
  } catch (err) {
    console.error("MailerLite addSubscriber failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add subscriber",
    };
  }
}

/**
 * Move a subscriber from Leads to Customers group
 * Called after successful purchase
 */
export async function moveSubscriberToCustomers(
  email: string
): Promise<MailerLiteResult> {
  const config = getConfig();

  if (!config) {
    return { success: false, error: "MailerLite not configured" };
  }

  if (!config.leadsGroupId || !config.customersGroupId) {
    console.warn("MailerLite group IDs not configured - skipping customer sync");
    return { success: false, error: "Groups not configured" };
  }

  try {
    // Step 1: Get subscriber ID by email
    const getResponse = await fetch(
      `${API_BASE}/subscribers/${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    if (!getResponse.ok) {
      // Subscriber doesn't exist - add directly to Customers
      if (getResponse.status === 404) {
        console.log(`MailerLite: Subscriber ${email.substring(0, 3)}*** not found, adding to Customers directly`);
        return await addSubscriberToCustomers(email, config);
      }
      const errorData = await getResponse.json();
      return {
        success: false,
        error: errorData.message || `HTTP ${getResponse.status}`,
      };
    }

    const subscriberData = await getResponse.json();
    const subscriberId = subscriberData.data?.id;

    if (!subscriberId) {
      return { success: false, error: "Could not get subscriber ID" };
    }

    // Step 2: Remove from Leads group
    const removeResponse = await fetch(
      `${API_BASE}/subscribers/${subscriberId}/groups/${config.leadsGroupId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    if (!removeResponse.ok && removeResponse.status !== 404) {
      console.warn(`MailerLite: Could not remove from Leads group (status ${removeResponse.status})`);
      // Continue anyway - adding to Customers is more important
    }

    // Step 3: Add to Customers group
    const addResponse = await fetch(`${API_BASE}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        email,
        groups: [config.customersGroupId],
      }),
    });

    if (!addResponse.ok) {
      const errorData = await addResponse.json();
      console.error("MailerLite addToCustomers error:", errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${addResponse.status}`,
      };
    }

    console.log(`✅ MailerLite: Moved ${email.substring(0, 3)}*** to Customers group`);
    return { success: true, subscriberId };
  } catch (err) {
    console.error("MailerLite moveToCustomers failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to move subscriber",
    };
  }
}

/**
 * Helper: Add subscriber directly to Customers group (when not in Leads)
 */
async function addSubscriberToCustomers(
  email: string,
  config: { apiKey: string; customersGroupId: string | undefined }
): Promise<MailerLiteResult> {
  if (!config.customersGroupId) {
    return { success: false, error: "Customers group not configured" };
  }

  try {
    const response = await fetch(`${API_BASE}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        email,
        groups: [config.customersGroupId],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    console.log(`✅ MailerLite: Added ${email.substring(0, 3)}*** to Customers group`);
    return { success: true, subscriberId: data.data?.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add to Customers",
    };
  }
}
