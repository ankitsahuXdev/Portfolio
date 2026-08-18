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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = { sendContactNotification, isConfigured };
