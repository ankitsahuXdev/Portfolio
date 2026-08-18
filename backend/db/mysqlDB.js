/**
 * Optional MySQL storage. Only used when DB_TYPE=mysql in .env.
 * Needs a running MySQL server (XAMPP/WAMP/local install/cloud DB — any is fine)
 * and the `messages` table from ../schema.sql to already exist.
 *
 * Uses mysql2 (pure JS driver — no native compilation required).
 */
const mysql = require("mysql2/promise");

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "portfolio",
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

async function init() {
  const conn = getPool();
  // Confirms we can actually reach MySQL with these credentials; throws a clear error if not.
  await conn.query("SELECT 1");
  // Creates the table automatically if it doesn't exist yet (schema.sql has the same definition).
  await conn.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      ip VARCHAR(64),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function saveMessage({ name, email, message, ip }) {
  const conn = getPool();
  const [result] = await conn.query(
    "INSERT INTO messages (name, email, message, ip) VALUES (?, ?, ?, ?)",
    [name, email, message, ip || null]
  );
  return { id: result.insertId, name, email, message, ip, created_at: new Date().toISOString() };
}

async function getMessages() {
  const conn = getPool();
  const [rows] = await conn.query("SELECT * FROM messages ORDER BY created_at DESC LIMIT 200");
  return rows;
}

module.exports = { init, saveMessage, getMessages };
