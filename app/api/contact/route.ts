import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secureEnv = process.env.SMTP_SECURE;
  const secure = secureEnv !== undefined ? secureEnv === "true" : port === 465;

  if (!user || !pass) return null;

  if ((!host && user.endsWith("@gmail.com")) || (host && host.includes("gmail"))) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, serviceType, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const recipient = process.env.SMTP_EMAIL || process.env.SMTP_USER || "morsjewelry@gmail.com";
    const transporter = createTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Mor's Jewelry Inquiries" <${process.env.SMTP_USER || recipient}>`,
          to: recipient,
          replyTo: email,
          subject: `✨ New Inquiry from ${name} - ${serviceType || "Customer Service"}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0b0b0b; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #D4AF37;">
              <h2 style="color: #D4AF37; margin-top: 0; font-size: 22px;">New Consultation Request</h2>
              <p style="color: #e5e5e5; font-size: 14px;">You have received a new consultation inquiry through Mor's Jewelry website:</p>
              
              <div style="background-color: #171717; border-left: 4px solid #D4AF37; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 6px 0;"><strong>Customer:</strong> ${name}</p>
                <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #F3D382;">${email}</a></p>
                <p style="margin: 6px 0;"><strong>Phone:</strong> ${phone || "Not provided"}</p>
                <p style="margin: 6px 0;"><strong>Service Requested:</strong> <span style="color: #D4AF37; font-weight: bold;">${serviceType || "General Consultation"}</span></p>
              </div>

              <div style="background-color: #1a1a1a; padding: 16px; border-radius: 6px; margin-top: 15px;">
                <h4 style="color: #D4AF37; margin: 0 0 10px 0;">Message:</h4>
                <p style="margin: 0; color: #d4d4d4; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>

              <p style="color: #737373; font-size: 11px; margin-top: 25px; border-top: 1px solid #262626; padding-top: 15px;">
                Mor's Jewelry & Repair • Stonecrest Mall & McDonough, GA
              </p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error("Failed to dispatch email notification:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Our master jewelers will contact you shortly.",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process inquiry." },
      { status: 500 }
    );
  }
}
