/**
 * Resend email utility for sending confirmation emails
 */

import { Resend } from "resend";

// Lazy-initialize Resend to avoid build-time errors when env vars aren't set
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is not configured - emails will not be sent");
    return null;
  }
  return new Resend(key);
}

interface SendConfirmationEmailParams {
  email: string;
  sessionId: string;
  baseUrl: string;
}

const SUPPORT_EMAIL = "support@astropowermap.com";

/**
 * Send purchase confirmation email with permanent map link
 * Uses inline styles for Gmail compatibility
 */
export async function sendConfirmationEmail({
  email,
  sessionId,
  baseUrl,
}: SendConfirmationEmailParams): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();

  if (!resend) {
    return { success: false, error: "Email service not configured" };
  }

  const mapUrl = `${baseUrl}/map?sid=${sessionId}`;
  const loginUrl = `${baseUrl}/login`;

  // Login instructions section
  const loginSection = `
              <!-- Account Access Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.02) 100%); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="font-size: 14px; color: #4ade80; margin: 0 0 8px 0; font-weight: 600;">✨ Access Your Stella+ Dashboard</p>
                    <p style="font-size: 14px; color: #b5b5b5; margin: 0 0 16px 0;">Get daily cosmic guidance, power day alerts, and chat with Stella — your personal astrology AI.</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: #0a0a0f; text-align: center; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 15px;">Log In to Dashboard →</a>
                        </td>
                      </tr>
                    </table>
                    <p style="text-align: center; font-size: 12px; color: #666666; margin: 12px 0 0 0;">Use your email and the password you created to log in anytime.</p>
                  </td>
                </tr>
              </table>
    `;

  try {
    const { error } = await resend.emails.send({
      from: "Astro Power Maps <noreply@astropowermap.com>",
      to: [email],
      subject: "You're In — Your 2026 Power Map is Ready",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Your 2026 Power Map</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #e5e5e5; line-height: 1.7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <div style="font-size: 24px; margin-bottom: 16px;">🌙</div>
              <h1 style="font-size: 28px; font-weight: 600; color: #C9A227; margin: 0 0 8px 0;">You're In.</h1>
              <p style="color: #888888; font-size: 16px; margin: 0;">Your 2026 Power Map is ready</p>
            </td>
          </tr>

          <!-- Main Content Box -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(201, 162, 39, 0.02) 100%); border: 1px solid rgba(201, 162, 39, 0.2); border-radius: 16px; padding: 32px;">

              <p style="font-size: 18px; margin: 0 0 20px 0; color: #ffffff;">Hey there 👋</p>

              <p style="margin: 0 0 16px 0; color: #b5b5b5; font-size: 15px;">First off — <span style="color: #C9A227;">thank you</span>. Seriously. You just trusted us with something as personal as your birth chart, and that means everything.</p>

              <p style="margin: 0 0 16px 0; color: #b5b5b5; font-size: 15px;">We're not some big faceless company chasing numbers. It's a small team building this from scratch because we genuinely believe knowing your power places and power months can change how you plan your year.</p>

              <p style="margin: 0 0 16px 0; color: #b5b5b5; font-size: 15px;">You're not just a customer — you're part of the community now. And without people like you, there is no us.</p>

              <!-- Link Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(201, 162, 39, 0.3); border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="font-size: 13px; color: #C9A227; margin: 0 0 12px 0; font-weight: 500;">Your permanent access link:</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(201, 162, 39, 0.1); border: 1px solid rgba(201, 162, 39, 0.2); border-radius: 8px; margin-bottom: 16px;">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <a href="${mapUrl}" style="color: #C9A227; text-decoration: none; word-break: break-all; font-size: 14px;">${mapUrl}</a>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${mapUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A227 0%, #d4af37 100%); color: #0a0a0f; text-align: center; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">Explore Your Map →</a>
                        </td>
                      </tr>
                    </table>
                    <p style="text-align: center; font-size: 13px; color: #666666; margin: 12px 0 0 0;">Bookmark this — it's yours forever, on any device.</p>
                  </td>
                </tr>
              </table>

              <!-- Personal Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid rgba(201, 162, 39, 0.5); border-radius: 0 12px 12px 0; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px 0; font-style: italic; color: #999999; font-size: 15px;">As hard as we try, things might not always be perfect. If you ever notice something off or have an idea that would make your experience better — we genuinely want to hear it.</p>
                    <p style="margin: 0; color: #C9A227; font-size: 15px; font-weight: 500;">We're constantly improving this, and your feedback helps us make it better for everyone.</p>
                  </td>
                </tr>
              </table>

              ${loginSection}

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td style="height: 1px; background: linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.3), transparent);"></td>
                </tr>
              </table>

              <!-- Share Section -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <p style="color: #888888; font-size: 14px; margin: 0 0 8px 0;">Know someone who'd find their power places fascinating?</p>
                    <p style="color: #888888; font-size: 14px; margin: 0;">Feel free to share the love ✨</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Support Section -->
          <tr>
            <td style="padding-top: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(201, 162, 39, 0.05); border-radius: 12px;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #b5b5b5;">Questions, ideas, or just want to say hi?</p>
                    <p style="margin: 0; font-size: 14px; color: #b5b5b5;">We're always here: <a href="mailto:${SUPPORT_EMAIL}" style="color: #C9A227; text-decoration: none; font-weight: 500;">${SUPPORT_EMAIL}</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 12px; letter-spacing: 1.5px; color: #555555; margin: 0 0 8px 0;">2026 POWER MAP</p>
              <p style="font-size: 12px; color: #444444; margin: 0;">© 2025 Astro Power Maps. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Confirmation email sent to ${email.substring(0, 3)}***`);
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
