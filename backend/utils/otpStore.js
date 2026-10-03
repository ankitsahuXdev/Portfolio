/**
 * Email OTP verification (kept in memory).
 *
 * Flow:
 *   1. create(email)            -> 6-digit OTP (emailed to the visitor)
 *   2. verify(email, otp)       -> if correct, returns a short-lived signed token
 *   3. consumeToken(token, email) -> /api/contact calls this; token works ONCE
 *
 * A message can only be saved with a valid token, so nobody can skip the OTP step
 * by calling the API directly.
 */
const crypto = require("crypto");

const OTP_TTL_MS = 10 * 60 * 1000;     // OTP valid for 10 minutes
const TOKEN_TTL_MS = 15 * 60 * 1000;   // after verifying, visitor has 15 min to send the message
const MAX_ATTEMPTS = 5;                // wrong tries allowed per OTP
const RESEND_GAP_MS = 60 * 1000;       // min gap between OTP emails to one address

// Secret used to sign tokens. Set OTP_SECRET in .env for tokens that survive restarts.
const SECRET =
  process.env.OTP_SECRET || process.env.ADMIN_KEY || crypto.randomBytes(32).toString("hex");

const pending = new Map();   // email -> { otpHash, createdAt, expiresAt, attempts }
const usedTokens = new Map(); // token -> expiry (so a token can't be reused)

const sha = (v) => crypto.createHash("sha256").update(String(v)).digest("hex");
const sign = (payload) => crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

function create(email) {
  const key = email.toLowerCase();
  const old = pending.get(key);
  if (old && Date.now() - old.createdAt < RESEND_GAP_MS) {
    const wait = Math.ceil((RESEND_GAP_MS - (Date.now() - old.createdAt)) / 1000);
    const err = new Error(`Please wait ${wait}s before requesting another code.`);
    err.code = "TOO_SOON";
    throw err;
  }
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  pending.set(key, {
    otpHash: sha(otp),
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return otp;
}

function discard(email) {
  pending.delete(email.toLowerCase());
}

function verify(email, otp) {
  const key = email.toLowerCase();
  const rec = pending.get(key);
  if (!rec) return { ok: false, error: "Please click “Send OTP” first." };
  if (Date.now() > rec.expiresAt) {
    pending.delete(key);
    return { ok: false, error: "Code expired. Please request a new OTP." };
  }
  rec.attempts += 1;
  if (rec.attempts > MAX_ATTEMPTS) {
    pending.delete(key);
    return { ok: false, error: "Too many wrong attempts. Please request a new OTP." };
  }
  if (sha(String(otp).trim()) !== rec.otpHash) {
    return { ok: false, error: "Wrong code. Please check your email and try again." };
  }
  pending.delete(key);

  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${key}|${exp}`;
  const token = Buffer.from(payload).toString("base64url") + "." + sign(payload);
  return { ok: true, token };
}

// Returns true only for a valid, unexpired, unused token that was issued for this email.
function consumeToken(token, email) {
  try {
    const [b64, sig] = String(token || "").split(".");
    if (!b64 || !sig) return false;
    const payload = Buffer.from(b64, "base64url").toString();
    const expected = sign(payload);
    if (sig.length !== expected.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;

    const [tokEmail, exp] = payload.split("|");
    if (tokEmail !== email.toLowerCase()) return false;
    if (Date.now() > Number(exp)) return false;
    if (usedTokens.has(token)) return false;

    usedTokens.set(token, Number(exp));
    return true;
  } catch {
    return false;
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pending) if (now > v.expiresAt) pending.delete(k);
  for (const [k, exp] of usedTokens) if (now > exp) usedTokens.delete(k);
}, 60 * 1000).unref();

module.exports = { create, discard, verify, consumeToken };
