/**
 * Sends you an email the instant someone submits your contact form.
 * Email pushes a notification to your phone/laptop through your
 * normal Gmail/Outlook app — so this is how you "find out" about it.
 *
 * If EMAIL_USER / EMAIL_PASS aren't set in .env, this quietly does
 * nothing (the message is still saved to the database either way).
 *
 * How to get a Gmail "App Password" is explained in README.md.
 */
const nodemailer = require("nodemailer");

function isConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

async function sendContactNotification({ name, email, message }) {
  if (!isConfigured()) {
    console.log("[mailer] EMAIL_USER/EMAIL_PASS not set — skipping email notification.");
    return { sent: false, reason: "not_configured" };
  }

  const to = process.env.NOTIFY_EMAIL || process.env.EMAIL_USER;

  await getTransporter().sendMail({
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to,
    replyTo: email,
    subject: `New portfolio message from ${name}`,
    text: `You got a new message from your portfolio site.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px">
        <h2 style="color:#e0202b;margin-bottom:4px;">New portfolio message</h2>
        <p style="color:#555;margin-top:0;">You got a new message from your portfolio contact form.</p>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Message:</b></p>
        <p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px;">${escapeHtml(message)}</p>
      </div>
    `,
  });

  return { sent: true };
}

async function sendOtpEmail({ email, otp }) {
  if (!isConfigured()) throw new Error("EMAIL_USER/EMAIL_PASS not set — cannot send OTP.");
  await getTransporter().sendMail({
    from: `"Ankit Sahu Portfolio" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your verification code: ${otp}`,
    text: `Your verification code is ${otp}. It is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px">
        <h2 style="color:#e0202b;margin-bottom:4px;">Verify your email</h2>
        <p>Use this code to verify your email on Ankit Sahu's portfolio:</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:700;background:#f5f5f5;padding:14px;border-radius:8px;text-align:center;">${otp}</p>
        <p style="color:#555;">Valid for 10 minutes. If this wasn't you, just ignore this email.</p>
      </div>`,
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = { sendContactNotification, sendOtpEmail, isConfigured };
