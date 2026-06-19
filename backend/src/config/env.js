// src/config/env.js
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const VALID_NODE_ENVS = new Set(["development", "test", "production"]);

const DEVELOPMENT_ALLOWED_ORIGINS = Object.freeze([
  "http://localhost:5173",
  "http://localhost:5174",
]);

const LOCALHOST_VALUES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

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

function getCookieSameSite(name, fallback = "lax") {
  const value = String(process.env[name] ?? "")
    .trim()
    .toLowerCase();

  if (["strict", "lax", "none"].includes(value)) {
    return value;
  }

  return fallback;
}

function getTrustProxy(name, fallback = false) {
  const rawValue = String(process.env[name] ?? "").trim();

  if (!rawValue) return fallback;

  const normalized = rawValue.toLowerCase();

  if (["true", "yes", "on"].includes(normalized)) return true;
  if (["false", "no", "off"].includes(normalized)) return false;

  const numericValue = Number(normalized);

  if (
    Number.isFinite(numericValue) &&
    Number.isInteger(numericValue) &&
    numericValue >= 0
  ) {
    return numericValue;
  }

  return rawValue;
}

function getNodeEnv() {
  const value = String(process.env.NODE_ENV || "development")
    .trim()
    .toLowerCase();

  if (!VALID_NODE_ENVS.has(value)) {
    console.error(
      "[env] NODE_ENV inválido. Usa: development, test ou production.",
    );
    process.exit(1);
  }

  return value;
}

function hasExplicitEnvValue(name) {
  return String(process.env[name] ?? "").trim().length > 0;
}

function getUrlHostname(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^\[(.*)\]$/, "$1");
  } catch {
    return "";
  }
}

function isLocalOrigin(origin) {
  return LOCALHOST_VALUES.has(getUrlHostname(origin));
}

function isLocalDatabaseUrl(databaseUrl) {
  return LOCALHOST_VALUES.has(getUrlHostname(databaseUrl));
}

if (!process.env.DATABASE_URL) {
  console.error("[env] DATABASE_URL em falta.");
  process.exit(1);
}

const nodeEnv = getNodeEnv();
const isProduction = nodeEnv === "production";

const env = Object.freeze({
  NODE_ENV: nodeEnv,
  PORT: getNumber("PORT", 3001),
  TZ: process.env.TZ || "Europe/Lisbon",

  DATABASE_URL: process.env.DATABASE_URL,
  JSON_LIMIT: process.env.JSON_LIMIT || "1mb",
  TRUST_PROXY: getTrustProxy("TRUST_PROXY", false),

  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
  AUTH_COOKIE_NAME:
    process.env.AUTH_COOKIE_NAME || "farmacia_santacasa_session",
  AUTH_TOKEN_EXPIRES_IN: process.env.AUTH_TOKEN_EXPIRES_IN || "8h",
  AUTH_COOKIE_MAX_AGE_MS: getNumber(
    "AUTH_COOKIE_MAX_AGE_MS",
    1000 * 60 * 60 * 8,
  ),
  AUTH_COOKIE_SECURE: getBoolean("AUTH_COOKIE_SECURE", isProduction),
  AUTH_COOKIE_SAME_SITE: getCookieSameSite(
    "AUTH_COOKIE_SAME_SITE",
    isProduction ? "none" : "lax",
  ),

  AUTH_LOGIN_RATE_LIMIT_WINDOW_MS: getNumber(
    "AUTH_LOGIN_RATE_LIMIT_WINDOW_MS",
    1000 * 60 * 15,
  ),
  AUTH_LOGIN_RATE_LIMIT_MAX: getNumber("AUTH_LOGIN_RATE_LIMIT_MAX", 10),

  ALLOWED_ORIGINS: getList(
    "ALLOWED_ORIGINS",
    isProduction ? [] : DEVELOPMENT_ALLOWED_ORIGINS,
  ),

  ENABLE_JOBS: getBoolean("ENABLE_JOBS", !isProduction),
  ENABLE_HIGIENE: getBoolean("ENABLE_HIGIENE", true),
  ENABLE_PURGE_HISTORY: getBoolean("ENABLE_PURGE_HISTORY", true),
  ENABLE_RECEITAS_EXPIRY: getBoolean("ENABLE_RECEITAS_EXPIRY", true),

  HIGIENE_OFFSET_MONTHS: getNumber("HIGIENE_OFFSET_MONTHS", 12),
  HIGIENE_ANONYMIZE: getBoolean("HIGIENE_ANONYMIZE", false),
  ALLOW_HIGIENE_ANONYMIZE: getBoolean("ALLOW_HIGIENE_ANONYMIZE", false),

  PURGE_OFFSET_MONTHS: getNumber("PURGE_OFFSET_MONTHS", 6),

  CRON_MONTHLY_03H: process.env.CRON_MONTHLY_03H || "0 3 1 * *",
  CRON_DAILY_03H: process.env.CRON_DAILY_03H || "0 3 * * *",

  ALLOW_PRODUCTION_SEED: getBoolean("ALLOW_PRODUCTION_SEED", false),
});

if (isProduction && isLocalDatabaseUrl(env.DATABASE_URL)) {
  console.error(
    "[env] DATABASE_URL não pode apontar para localhost/127.0.0.1 em produção.",
  );
  process.exit(1);
}

if (!env.AUTH_JWT_SECRET) {
  console.error("[env] AUTH_JWT_SECRET em falta.");
  process.exit(1);
}

if (isProduction && env.AUTH_JWT_SECRET.length < 32) {
  console.error(
    "[env] AUTH_JWT_SECRET deve ter pelo menos 32 caracteres em produção.",
  );
  process.exit(1);
}

if (isProduction && !env.AUTH_COOKIE_SECURE) {
  console.error("[env] AUTH_COOKIE_SECURE deve ser true em produção.");
  process.exit(1);
}

if (env.AUTH_COOKIE_SAME_SITE === "none" && !env.AUTH_COOKIE_SECURE) {
  console.error(
    "[env] AUTH_COOKIE_SAME_SITE=none exige AUTH_COOKIE_SECURE=true.",
  );
  process.exit(1);
}

if (isProduction && !hasExplicitEnvValue("ALLOWED_ORIGINS")) {
  console.error("[env] ALLOWED_ORIGINS é obrigatório em produção.");
  process.exit(1);
}

if (isProduction && env.ALLOWED_ORIGINS.length === 0) {
  console.error("[env] ALLOWED_ORIGINS não pode estar vazio em produção.");
  process.exit(1);
}

if (isProduction && env.ALLOWED_ORIGINS.includes("*")) {
  console.error("[env] ALLOWED_ORIGINS não pode conter '*' em produção.");
  process.exit(1);
}

if (isProduction && env.ALLOWED_ORIGINS.some(isLocalOrigin)) {
  console.error(
    "[env] ALLOWED_ORIGINS não pode conter localhost/127.0.0.1 em produção.",
  );
  process.exit(1);
}

process.env.TZ = env.TZ;

module.exports = {
  env,
};
