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
 * Send purchase confirmation email with login link
 * Simple, clean email that just directs users to log in
 */
export async function sendConfirmationEmail({
  email,
  baseUrl,
}: SendConfirmationEmailParams): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();

  if (!resend) {
    return { success: false, error: "Email service not configured" };
  }

  const loginUrl = `${baseUrl}/login`;

  try {
    const { error } = await resend.emails.send({
      from: "AstroPowerMap <noreply@astropowermap.com>",
      to: [email],
      subject: "Welcome to Stella+ — Your Power Map is Ready ✨",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Stella+</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #e5e5e5; line-height: 1.7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="font-size: 40px; margin-bottom: 16px;">✨</div>
              <h1 style="font-size: 28px; font-weight: 600; color: #C9A227; margin: 0 0 8px 0;">Welcome to Stella+</h1>
              <p style="color: #888888; font-size: 16px; margin: 0;">Your 2026 Power Map is ready</p>
            </td>
          </tr>

          <!-- Main Content Box -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(201, 162, 39, 0.02) 100%); border: 1px solid rgba(201, 162, 39, 0.2); border-radius: 16px; padding: 32px;">

              <p style="font-size: 16px; margin: 0 0 20px 0; color: #ffffff;">Hey there 👋</p>

              <p style="margin: 0 0 24px 0; color: #b5b5b5; font-size: 15px;">Thank you for joining Stella+! Your personalized astrocartography map is ready to explore.</p>

              <!-- Login Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #E8C547 0%, #C9A227 100%); color: #0a0a0f; text-align: center; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">Log In to Your Account →</a>
                  </td>
                </tr>
              </table>

              <p style="text-align: center; font-size: 13px; color: #666666; margin: 0;">Use your email and password to access your map anytime.</p>

            </td>
          </tr>

          <!-- What's Included -->
          <tr>
            <td style="padding-top: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(201, 162, 39, 0.05); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="font-size: 14px; color: #C9A227; margin: 0 0 12px 0; font-weight: 600;">What's included:</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #b5b5b5;">🗺️ Your personalized power map</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #b5b5b5;">📅 Daily cosmic guidance</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #b5b5b5;">💬 Chat with Stella AI</p>
                    <p style="margin: 0; font-size: 14px; color: #b5b5b5;">⚡ Power day alerts</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="font-size: 13px; color: #666666; margin: 0;">Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color: #C9A227; text-decoration: none;">${SUPPORT_EMAIL}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="font-size: 11px; color: #444444; margin: 0;">© 2025 AstroPowerMap. All rights reserved.</p>
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

interface SendGrandfatheredInviteParams {
  email: string;
  setupUrl: string; // Magic link URL to set up account
}

/**
 * Send invite email to grandfathered users (existing one-time purchasers)
 * They get complimentary access to Stella+ as a thank you
 */
export async function sendGrandfatheredInviteEmail({
  email,
  setupUrl,
}: SendGrandfatheredInviteParams): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();

  if (!resend) {
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: "AstroPowerMap <noreply@astropowermap.com>",
      to: [email],
      subject: "You've Been Upgraded to Stella+ 🎁",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Upgraded!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #e5e5e5; line-height: 1.7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="font-size: 40px; margin-bottom: 16px;">🎁</div>
              <h1 style="font-size: 28px; font-weight: 600; color: #C9A227; margin: 0 0 8px 0;">You've Been Upgraded!</h1>
              <p style="color: #888888; font-size: 16px; margin: 0;">Your Stella+ access is ready</p>
            </td>
          </tr>

          <!-- Main Content Box -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(201, 162, 39, 0.02) 100%); border: 1px solid rgba(201, 162, 39, 0.2); border-radius: 16px; padding: 32px;">

              <p style="font-size: 16px; margin: 0 0 20px 0; color: #ffffff;">Hey there 👋</p>

              <p style="margin: 0 0 16px 0; color: #b5b5b5; font-size: 15px;">The launch of AstroPowerMap was a huge success — and it's all thanks to early supporters like you!</p>

              <p style="margin: 0 0 16px 0; color: #b5b5b5; font-size: 15px;">Because of this, we've been able to build something even better: <span style="color: #C9A227; font-weight: 600;">Stella+</span> — a completely upgraded astrology experience with daily guidance, AI chat, and more.</p>

              <p style="margin: 0 0 24px 0; color: #b5b5b5; font-size: 15px;">As a thank you for believing in us from the start, <strong style="color: #ffffff;">your access is on us</strong>.</p>

              <!-- Setup Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${setupUrl}" style="display: inline-block; background: linear-gradient(135deg, #E8C547 0%, #C9A227 100%); color: #0a0a0f; text-align: center; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">Activate My Access →</a>
                  </td>
                </tr>
              </table>

              <p style="text-align: center; font-size: 13px; color: #666666; margin: 0;">Click to create your password and access your map.</p>

            </td>
          </tr>

          <!-- What's Included -->
          <tr>
            <td style="padding-top: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(201, 162, 39, 0.05); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="font-size: 14px; color: #C9A227; margin: 0 0 12px 0; font-weight: 600;">What's included:</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #b5b5b5;">🗺️ Your personalized 2026 Power Map</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #b5b5b5;">📅 Daily cosmic guidance</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #b5b5b5;">💬 Chat with Stella AI</p>
                    <p style="margin: 0; font-size: 14px; color: #b5b5b5;">⚡ Power day alerts & rituals</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="font-size: 13px; color: #666666; margin: 0;">Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color: #C9A227; text-decoration: none;">${SUPPORT_EMAIL}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="font-size: 11px; color: #444444; margin: 0;">© 2025 AstroPowerMap. All rights reserved.</p>
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

    console.log(`✅ Grandfathered invite email sent to ${email.substring(0, 3)}***`);
    return { success: true };
  } catch (err) {
    console.error("Failed to send grandfathered invite email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
