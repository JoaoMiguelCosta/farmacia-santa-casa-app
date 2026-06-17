// src/middlewares/loginRateLimit.js
const { env } = require("../config/env");

const loginAttempts = new Map();

function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function getLoginIdentifier(req) {
  const ip = getClientIp(req);
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  return email ? `${ip}:${email}` : ip;
}

function getFreshRecord(identifier, now) {
  const currentRecord = loginAttempts.get(identifier);

  if (!currentRecord || currentRecord.resetAt <= now) {
    return {
      count: 0,
      resetAt: now + env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS,
    };
  }

  return currentRecord;
}

function getRetryAfterSeconds(resetAt, now) {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}

function clearLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

function registerFailedLogin(identifier, now) {
  const record = getFreshRecord(identifier, now);

  loginAttempts.set(identifier, {
    ...record,
    count: record.count + 1,
  });
}

function loginRateLimit(req, res, next) {
  const maxAttempts = env.AUTH_LOGIN_RATE_LIMIT_MAX;
  const windowMs = env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS;

  if (
    !Number.isFinite(maxAttempts) ||
    !Number.isFinite(windowMs) ||
    maxAttempts <= 0 ||
    windowMs <= 0
  ) {
    return next();
  }

  const now = Date.now();
  const identifier = getLoginIdentifier(req);
  const record = getFreshRecord(identifier, now);

  if (record.count >= maxAttempts) {
    const retryAfter = getRetryAfterSeconds(record.resetAt, now);

    res.setHeader("Retry-After", String(retryAfter));

    return res.status(429).json({
      error: "TOO_MANY_REQUESTS",
      message:
        "Demasiadas tentativas de login. Aguarda alguns minutos e tenta novamente.",
      retryAfter,
    });
  }

  res.on("finish", () => {
    if (res.statusCode === 401) {
      registerFailedLogin(identifier, Date.now());
      return;
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      clearLoginAttempts(identifier);
    }
  });

  return next();
}

module.exports = {
  loginRateLimit,
};
