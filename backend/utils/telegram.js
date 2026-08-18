/**
 * Optional: instant push notification straight to your phone via Telegram
 * (usually arrives faster than email). Totally free.
 *
 * Setup (README has the full walkthrough):
 *   1. Message @BotFather on Telegram -> /newbot -> copy the bot token.
 *   2. Message your new bot once (anything).
 *   3. Visit https://api.telegram.org/bot<TOKEN>/getUpdates to find your chat_id.
 *   4. Put both in .env as TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.
 *
 * If these aren't set, this quietly does nothing.
 */

function isConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

async function sendTelegramNotification({ name, email, message }) {
  if (!isConfigured()) {
    console.log("[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set — skipping Telegram notification.");
    return { sent: false, reason: "not_configured" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const text =
    `📩 *New Portfolio Message*\n\n` +
    `*Name:* ${name}\n` +
    `*Email:* ${email}\n` +
    `*Message:*\n${message}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text}),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telegram API error (${res.status}): ${body}`);
  }

  return { sent: true };
}

module.exports = { sendTelegramNotification, isConfigured };
