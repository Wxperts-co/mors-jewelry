import nodemailer from "nodemailer";

interface SendOtpEmailParams {
  to: string;
  otp: string;
  adminName?: string;
}

/**
 * Creates a nodemailer transporter based on environment variables.
 * Supports Gmail (smtp.gmail.com) and custom SMTP servers.
 */
function createTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secureEnv = process.env.SMTP_SECURE;
  const secure = secureEnv !== undefined ? secureEnv === "true" : port === 465;

  if (!user || !pass) {
    return null;
  }

  // If using Gmail directly and no host specified or host is gmail
  if ((!host && user.endsWith("@gmail.com")) || (host && host.includes("gmail"))) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  // Custom SMTP server (Brevo, Resend, SendGrid, Mailgun, Amazon SES, or custom domain SMTP)
  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

/**
 * Sends a real 6-digit OTP verification email for administrator password reset.
 */
export async function sendPasswordResetOtpEmail({
  to,
  otp,
  adminName = "Administrator",
}: SendOtpEmailParams): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      `[MORS JEWELRY EMAIL WARNING] SMTP credentials (SMTP_USER / SMTP_PASS) not found in environment.`
    );
    return {
      success: false,
      error:
        "Email server credentials (SMTP_USER and SMTP_PASS) are not configured in .env.local yet.",
    };
  }

  const fromEmail =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    "noreply@morsjewelry.com";

  const mailOptions = {
    from: `"Mor's Jewelry Security" <${fromEmail}>`,
    to,
    subject: `Your Password Reset OTP: ${otp} - Mor's Jewelry`,
    text: `Hello ${adminName},\n\nYour 6-digit verification code to reset your Mor's Jewelry administrator password is:\n\n${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this change, please ignore this email or contact support.\n\nMor's Jewelry & Repair\nhttps://morsjewelry.com`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0c0c0c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f3f3;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0c0c0c; padding: 40px 15px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="520" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #141414; border: 1px solid #D4AF37; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);">
                  <!-- Gold accent top bar -->
                  <tr>
                    <td height="5" style="background: linear-gradient(90deg, #997328, #D4AF37, #F6E6B4, #D4AF37, #997328);"></td>
                  </tr>
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 20px 32px; text-align: center;">
                      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 2px; color: #F3D382; text-transform: uppercase;">
                        MOR'S JEWELRY
                      </h1>
                      <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; color: #a0a0a0; text-transform: uppercase;">
                        FINE JEWELRY & REPAIR
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 32px;">
                      <div style="height: 1px; background-color: #262626;"></div>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 30px 32px;">
                      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #ffffff; font-weight: 600;">
                        Administrator Password Reset
                      </h2>
                      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #b3b3b3;">
                        Hello <strong style="color: #ffffff;">${adminName}</strong>,<br>
                        We received a request to reset your password for the Mor's Jewelry Administrator Portal. Use the one-time verification code below to verify your identity:
                      </p>

                      <!-- OTP Box -->
                      <div style="background-color: #0a0a0a; border: 1px solid #D4AF37; border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 24px;">
                        <span style="display: block; font-size: 11px; letter-spacing: 2px; color: #a38531; text-transform: uppercase; margin-bottom: 8px;">
                          Your 6-Digit OTP Code
                        </span>
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #F3D382;">
                          ${otp}
                        </span>
                        <span style="display: block; font-size: 12px; color: #737373; margin-top: 10px;">
                          ⏱️ Code expires in <strong>10 minutes</strong>
                        </span>
                      </div>

                      <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #8c8c8c;">
                        Do not share this code with anyone. If you did not initiate this password reset, your account may be compromised. Please sign in and review your account security immediately.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #0e0e0e; border-top: 1px solid #202020; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #666666; line-height: 1.5;">
                        Mor's Jewelry & Repair • Stonecrest & McDonough, GA<br>
                        This is an automated security notification.
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MORS JEWELRY] Real OTP email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[MORS JEWELRY EMAIL ERROR] Failed to send email to ${to}:`, error);
    return {
      success: false,
      error: error?.message || "Failed to send email through SMTP transporter.",
    };
  }
}
