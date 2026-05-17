// src/config/env.js
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

function getBoolean(name, fallback = false) {
  const value = String(process.env[name] ?? "")
    .trim()
    .toLowerCase();

  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;

  return fallback;
}

function getNumber(name, fallback) {
  const value = Number(process.env[name]);

  return Number.isFinite(value) ? value : fallback;
}

function getList(name, fallback = []) {
  const value = process.env[name];

  if (!value) return fallback;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

if (!process.env.DATABASE_URL) {
  console.error("[env] DATABASE_URL em falta.");
  process.exit(1);
}

const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: getNumber("PORT", 3001),
  TZ: process.env.TZ || "Europe/Lisbon",

  DATABASE_URL: process.env.DATABASE_URL,
  JSON_LIMIT: process.env.JSON_LIMIT || "1mb",

  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
  AUTH_COOKIE_NAME:
    process.env.AUTH_COOKIE_NAME || "farmacia_santacasa_session",
  AUTH_TOKEN_EXPIRES_IN: process.env.AUTH_TOKEN_EXPIRES_IN || "8h",
  AUTH_COOKIE_MAX_AGE_MS: getNumber(
    "AUTH_COOKIE_MAX_AGE_MS",
    1000 * 60 * 60 * 8,
  ),
  AUTH_COOKIE_SECURE: getBoolean("AUTH_COOKIE_SECURE", false),

  MAINTENANCE_API_KEY:
    process.env.MAINTENANCE_API_KEY ||
    (process.env.NODE_ENV === "production" ? "" : "dev-maintenance-key"),

  ALLOWED_ORIGINS: getList("ALLOWED_ORIGINS", [
    "http://localhost:5173",
    "http://localhost:5174",
  ]),

  ENABLE_HIGIENE: getBoolean("ENABLE_HIGIENE", true),
  ENABLE_PURGE_HISTORY: getBoolean("ENABLE_PURGE_HISTORY", true),
  ENABLE_RECEITAS_EXPIRY: getBoolean("ENABLE_RECEITAS_EXPIRY", true),

  HIGIENE_OFFSET_MONTHS: getNumber("HIGIENE_OFFSET_MONTHS", 12),
  HIGIENE_ANONYMIZE: getBoolean("HIGIENE_ANONYMIZE", false),
  ALLOW_HIGIENE_ANONYMIZE: getBoolean("ALLOW_HIGIENE_ANONYMIZE", false),

  PURGE_OFFSET_MONTHS: getNumber("PURGE_OFFSET_MONTHS", 6),

  CRON_MONTHLY_03H: process.env.CRON_MONTHLY_03H || "0 3 1 * *",
  CRON_DAILY_03H: process.env.CRON_DAILY_03H || "0 3 * * *",
});

if (!env.AUTH_JWT_SECRET) {
  console.error("[env] AUTH_JWT_SECRET em falta.");
  process.exit(1);
}

process.env.TZ = env.TZ;

module.exports = {
  env,
};
