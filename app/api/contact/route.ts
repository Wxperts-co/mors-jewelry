import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Zod schema for contact inquiry validation
const contactSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().email("Please provide a valid email address."),
  phone: z.string().trim().optional().default(""),
  serviceType: z.string().trim().default("Custom Engagement Ring"),
  message: z.string().trim().min(5, "Message must be at least 5 characters long."),
  captchaInput: z.string().trim().min(1, "Security captcha is required."),
  captchaCode: z.string().trim().min(1, "Captcha code is missing."),
});

function createTransporter() {
  const host = process.env.SMTP_HOST || "mail.morsjewelrys.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "no-reply@morsjewelrys.com";
  const pass = process.env.SMTP_PASSWORD;

  if (!pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // port 587 uses STARTTLS
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// Generate luxury HTML email for Admin & BCC
function generateAdminEmailHtml(data: {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
  dateStr: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Customer Consultation Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080809; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080809; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #121215; border: 1px solid #C5A059; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
          
          <!-- Header with Exact Logo -->
          <tr>
            <td align="center" style="padding: 35px 25px 20px 25px; background: linear-gradient(180deg, #1A1A20 0%, #121215 100%); border-bottom: 1px solid #2A2A30;">
              <img src="cid:morslogo" alt="Mor's Jewelry & Repair" width="200" style="display: block; width: 200px; max-width: 100%; height: auto; margin: 0 auto 12px auto;" />
              <div style="height: 1px; width: 80px; background: linear-gradient(90deg, transparent, #D4AF37, transparent); margin: 15px auto;"></div>
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; font-weight: 700;">
                Master Consultation Request
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                New Website Inquiry Received
              </h2>
              <p style="margin: 0 0 25px 0; font-size: 13px; line-height: 1.6; color: #A0A0A5;">
                A new customer inquiry has been submitted through the Contact Consultation form on the website.
              </p>

              <!-- Details Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #18181D; border: 1px solid #26262C; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 12px; color: #8E8E93; width: 35%; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Customer Name
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 14px; font-weight: 700; color: #FFFFFF;">
                    ${data.name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 12px; color: #8E8E93; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Email Address
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 13px; font-weight: 600; color: #F3D382;">
                    <a href="mailto:${data.email}" style="color: #F3D382; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 12px; color: #8E8E93; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Phone Number
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 13px; font-weight: 600; color: #FFFFFF;">
                    ${data.phone ? `<a href="tel:${data.phone}" style="color: #FFFFFF; text-decoration: none;">${data.phone}</a>` : '<span style="color: #666; font-style: italic;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 12px; color: #8E8E93; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Service Requested
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 13px;">
                    <span style="display: inline-block; background-color: #272010; color: #F3D382; border: 1px solid #D4AF37; padding: 3px 10px; border-radius: 20px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${data.serviceType}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #8E8E93; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Submission Date
                  </td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #C0C0C5;">
                    ${data.dateStr}
                  </td>
                </tr>
              </table>

              <!-- Customer Message Section -->
              <div style="background-color: #18181D; border-left: 3px solid #D4AF37; border-radius: 4px 12px 12px 4px; padding: 18px 20px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #D4AF37;">
                  Project Details / Message:
                </h4>
                <p style="margin: 0; font-size: 13px; line-height: 1.7; color: #E5E5E7; white-space: pre-wrap;">
${data.message}
                </p>
              </div>

              <!-- Reply Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 10px 0 20px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #BA8C37 0%, #F3D382 50%, #BA8C37 100%);">
                    <a href="mailto:${data.email}?subject=Re:%20Inquiry%20regarding%20${encodeURIComponent(data.serviceType)}%20-%20Mor's%20Jewelry" style="display: inline-block; padding: 12px 28px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #000000; text-decoration: none; border-radius: 10px;">
                      Reply to ${data.name}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #0E0E11; border-top: 1px solid #222228; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #D4AF37;">
                Mor's Jewelry & Repair
              </p>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #7A7A80;">
                Stonecrest Mall & McDonough Showrooms • Atlanta, Georgia<br/>
                Call: (470) 278-1018 | Mobile: (678) 389-1831
              </p>
              <p style="margin: 0; font-size: 10px; color: #55555B;">
                This notification was generated automatically from the website contact system.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Generate luxury HTML confirmation email for the Client
function generateClientEmailHtml(data: {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Mor's Jewelry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080809; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080809; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #121215; border: 1px solid #C5A059; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
          
          <!-- Header with Exact Logo -->
          <tr>
            <td align="center" style="padding: 35px 25px 20px 25px; background: linear-gradient(180deg, #1A1A20 0%, #121215 100%); border-bottom: 1px solid #2A2A30;">
              <img src="cid:morslogo" alt="Mor's Jewelry & Repair" width="200" style="display: block; width: 200px; max-width: 100%; height: auto; margin: 0 auto 12px auto;" />
              <div style="height: 1px; width: 80px; background: linear-gradient(90deg, transparent, #D4AF37, transparent); margin: 15px auto;"></div>
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; font-weight: 700;">
                Inquiry Confirmation
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px 20px 30px;">
              <h2 style="margin: 0 0 16px 0; font-size: 21px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                Thank You, ${data.name}!
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.7; color: #D0D0D5;">
                We have received your consultation inquiry regarding <strong style="color: #F3D382;">${data.serviceType}</strong>. Our team of master jewelers and diamond specialists is reviewing your project details.
              </p>
              <p style="margin: 0 0 25px 0; font-size: 13px; line-height: 1.6; color: #9A9AA0;">
                We pride ourselves on personalized attention and master craftsmanship. One of our specialists will be in touch with you shortly via email or phone to discuss your custom piece or consultation.
              </p>

              <!-- Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #18181D; border: 1px solid #26262C; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                <tr>
                  <td colspan="2" style="padding: 12px 16px; background-color: #202026; border-bottom: 1px solid #2A2A30; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #D4AF37;">
                    Summary of Your Request
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 12px; color: #8E8E93; width: 35%; font-weight: 600;">
                    Service / Inquiry
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 13px; font-weight: 700; color: #F3D382;">
                    ${data.serviceType}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 12px; color: #8E8E93; font-weight: 600;">
                    Contact Email
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 13px; color: #E5E5E7;">
                    ${data.email}
                  </td>
                </tr>
                ${data.phone ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 12px; color: #8E8E93; font-weight: 600;">
                    Contact Phone
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #26262C; font-size: 13px; color: #E5E5E7;">
                    ${data.phone}
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td colspan="2" style="padding: 14px 16px; font-size: 12.5px; color: #D5D5DA; line-height: 1.6;">
                    <strong style="color: #8E8E93; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Your Notes / Message:</strong>
                    <div style="background-color: #121215; padding: 12px; border-radius: 8px; border: 1px solid #26262C; color: #D0D0D5; font-style: italic;">
                      "${data.message}"
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Showroom Visit Card -->
              <div style="background-color: #16161B; border: 1px solid #282830; border-radius: 12px; padding: 18px 20px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #D4AF37; font-weight: 800;">
                  Showroom Locations & Business Hours
                </h4>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #C5C5CB; line-height: 1.5;">
                  <strong>Stonecrest Showroom:</strong> 2929 Turner Hill Rd, Stonecrest, GA 30038<br/>
                  <strong>McDonough Boutique:</strong> 99 Hwy 81 #108, McDonough, GA 30253
                </p>
                <p style="margin: 0; font-size: 11.5px; color: #8E8E93;">
                  Hours: Mon – Sat: 11:00 AM – 8:00 PM | Sun: 12:00 PM – 6:00 PM<br/>
                  Immediate Inquiries: <a href="tel:4702781018" style="color: #D4AF37; text-decoration: none; font-weight: bold;">(470) 278-1018</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #0E0E11; border-top: 1px solid #222228; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #D4AF37;">
                Mor's Jewelry & Master Repair
              </p>
              <p style="margin: 0; font-size: 11px; color: #7A7A80;">
                Handcrafted Fine Gold • Certified Natural & Lab Diamonds • Precision Repairs
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Zod Validation
    const validationResult = contactSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 }
      );
    }

    const { name, email, phone, serviceType, message, captchaInput, captchaCode } = validationResult.data;

    // 2. Security Captcha Check
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      return NextResponse.json(
        { success: false, message: "Security captcha does not match. Please try again." },
        { status: 400 }
      );
    }

    // 3. Prepare Email Transporter
    const transporter = createTransporter();
    const adminEmail = process.env.SMTP_EMAIL || "chrishevan01012000@gmail.com";
    const bccEmail = process.env.BCC_EMAIL || "hp14s.pocox2@gmail.com";
    const smtpUser = process.env.SMTP_USER || "no-reply@morsjewelrys.com";

    // Prepare embedded CID Logo
    const logoPath = path.join(process.cwd(), "public", "logo", "logo.png");
    const attachments = fs.existsSync(logoPath)
      ? [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "morslogo",
          },
        ]
      : [];

    const dateStr = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const adminHtml = generateAdminEmailHtml({
      name,
      email,
      phone,
      serviceType,
      message,
      dateStr,
    });

    const clientHtml = generateClientEmailHtml({
      name,
      email,
      phone,
      serviceType,
      message,
    });

    // 4. Parallely dispatch emails in the background using Promise.allSettled
    if (transporter) {
      // Background execution: dispatch emails in parallel
      const emailPromise = Promise.allSettled([
        // Email 1: Admin & BCC notification
        transporter.sendMail({
          from: `"Mor's Jewelry Inquiries" <${smtpUser}>`,
          to: adminEmail,
          bcc: bccEmail ? bccEmail : undefined,
          replyTo: email,
          subject: `✨ New Inquiry from ${name} - ${serviceType}`,
          html: adminHtml,
          attachments,
        }),
        // Email 2: Client confirmation receipt
        transporter.sendMail({
          from: `"Mor's Jewelry & Repair" <${smtpUser}>`,
          to: email,
          replyTo: adminEmail,
          subject: `✨ Consultation Inquiry Confirmation - Mor's Jewelry & Repair`,
          html: clientHtml,
          attachments,
        }),
      ]);

      // Ensure execution starts; we await with a short timeout so user gets instant response
      Promise.race([
        emailPromise,
        new Promise((resolve) => setTimeout(resolve, 80)),
      ]).catch((err) => {
        console.error("Background email process error:", err);
      });
    }

    // Return immediate success response so frontend transitions instantly to Thank You page
    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Your inquiry has been received.",
      inquiry: {
        name,
        email,
        phone,
        serviceType,
        message,
      },
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process inquiry." },
      { status: 500 }
    );
  }
}
