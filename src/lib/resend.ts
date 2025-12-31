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

/**
 * Send purchase confirmation email with permanent map link
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

  try {
    const { error } = await resend.emails.send({
      from: "Astro Power Maps <noreply@astropowermaps.com>",
      to: [email],
      subject: "Your 2026 Astro Power Map is Ready!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #050510; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050510; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #C9A227; font-size: 28px; margin: 0; font-weight: 600;">
                Your 2026 Power Map is Ready!
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(201, 162, 39, 0.05)); border: 1px solid rgba(201, 162, 39, 0.2); border-radius: 16px; padding: 30px;">
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your purchase! Your personalized astrocartography map is now available.
              </p>

              <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 0 0 15px 0;">
                <strong style="color: #C9A227;">Your permanent access link:</strong>
              </p>

              <!-- Link Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px;">
                    <a href="${mapUrl}" style="color: #6496ff; font-size: 14px; word-break: break-all; text-decoration: none;">
                      ${mapUrl}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${mapUrl}" style="display: inline-block; background: linear-gradient(135deg, #E8C547, #C9A227); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 50px;">
                      Explore Your Map
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 30px;">
              <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; text-align: center; margin: 0;">
                Bookmark this link to access your map anytime, on any device.
              </p>
              <p style="color: rgba(255, 255, 255, 0.3); font-size: 11px; text-align: center; margin: 15px 0 0 0;">
                &copy; 2025 Astro Power Maps. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
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
