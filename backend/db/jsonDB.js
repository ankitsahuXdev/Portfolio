/**
 * Zero-config storage: saves contact messages into a local JSON file.
 * No database installation needed — works the moment you run `npm start`.
 * Good default; switch to MySQL (db/mysqlDB.js) via DB_TYPE=mysql if you
 * want messages saved in MySQL / phpMyAdmin instead.
 */
const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "messages.json");

async function init() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readAll() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

async function saveMessage({ name, email, message, ip }) {
  const all = await readAll();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    email,
    message,
    ip: ip || null,
    created_at: new Date().toISOString(),
  };
  all.push(entry);
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf-8");
  return entry;
}

async function getMessages() {
  const all = await readAll();
  return all.slice().reverse(); // most recent first
}

module.exports = { init, saveMessage, getMessages };
