require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const mailer = require("./utils/mailer");
const telegram = require("./utils/telegram");

const DB_TYPE = (process.env.DB_TYPE || "json").toLowerCase();
const db = DB_TYPE === "mysql" ? require("./db/mysqlDB") : require("./db/jsonDB");

const app = express();
const PORT = process.env.PORT || 5000;

// Needed for correct client IPs (and correct rate limiting) when deployed
// behind a reverse proxy, which is how most free hosts (Render/Railway/etc.) work.
app.set("trust proxy", 1);

/* ---------- middleware ---------- */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*" ? process.env.CORS_ORIGIN : true,
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Basic spam protection: max 5 contact submissions per 15 minutes per IP.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many messages sent. Please try again later." },
});

/* ---------- helpers ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactPayload(body) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !message) return "All fields (name, email, message) are required.";
  if (name.length > 150) return "Name is too long.";
  if (!EMAIL_RE.test(email)) return "Please provide a valid email address.";
  if (message.length > 5000) return "Message is too long (max 5000 characters).";

  return null;
}

/* ---------- routes ---------- */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "ankit-portfolio-backend",
    dbType: DB_TYPE,
    endpoints: ["POST /api/contact", "GET /api/messages (admin key required)", "GET /admin"],
  });
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    // Honeypot: real visitors never fill this hidden field. If it's filled,
    // pretend success but don't actually save/notify (silently drops bots).
    if (req.body && req.body.website) {
      return res.json({ success: true });
    }

    const validationError = validateContactPayload(req.body || {});
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const name = String(req.body.name).trim();
    const email = String(req.body.email).trim();
    const message = String(req.body.message).trim();
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;

    // 1. Save the message — this must succeed for the request to count as successful.
    const saved = await db.saveMessage({ name, email, message, ip });

    // 2. Best-effort notifications — failures here are logged but never fail the request,
    //    since the message is already safely stored.
    Promise.allSettled([
      mailer.sendContactNotification({ name, email, message }),
      telegram.sendTelegramNotification({ name, email, message }),
    ]).then((results) => {
      results.forEach((r) => {
        if (r.status === "rejected") console.error("[notify] failed:", r.reason?.message || r.reason);
      });
    });

    res.json({ success: true, id: saved.id });
  } catch (err) {
    console.error("[POST /api/contact] error:", err);
    res.status(500).json({ success: false, error: "Server error. Please try again in a moment." });
  }
});

// Protected: view saved messages. Requires header "x-admin-key" to match ADMIN_KEY in .env.
app.get("/api/messages", async (req, res) => {
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey) {
    return res.status(503).json({
      success: false,
      error: "ADMIN_KEY is not set in .env — set one before using the admin panel.",
    });
  }

  if (req.headers["x-admin-key"] !== adminKey) {
    return res.status(401).json({ success: false, error: "Invalid admin key." });
  }

  try {
    const messages = await db.getMessages();
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    console.error("[GET /api/messages] error:", err);
    res.status(500).json({ success: false, error: "Could not load messages." });
  }
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found." });
});

/* ---------- startup ---------- */
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n✅ Backend running at http://localhost:${PORT}`);
      console.log(`   Storage: ${DB_TYPE.toUpperCase()}`);
      console.log(`   Email notifications: ${mailer.isConfigured() ? "ON" : "OFF (set EMAIL_USER/EMAIL_PASS in .env)"}`);
      console.log(`   Telegram notifications: ${telegram.isConfigured() ? "ON" : "OFF (set TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID in .env)"}`);
      console.log(`   Admin panel: http://localhost:${PORT}/admin\n`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server — database init failed:", err.message);
    process.exit(1);
  });
