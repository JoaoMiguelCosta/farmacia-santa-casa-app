// src/middlewares/originGuard.js
const { env } = require("../config/env");
const { forbidden } = require("../shared/errors/AppError");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isStateChangingRequest(method) {
  return !SAFE_METHODS.has(String(method || "").toUpperCase());
}

function getOriginFromReferer(referer) {
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function getRequestOrigin(req) {
  return req.headers.origin || getOriginFromReferer(req.headers.referer);
}

function isAllowedOrigin(origin) {
  if (!origin) return false;

  return env.ALLOWED_ORIGINS.includes(origin);
}

function shouldAllowMissingOrigin() {
  return env.NODE_ENV !== "production";
}

function originGuard(req, _res, next) {
  if (!isStateChangingRequest(req.method)) {
    return next();
  }

  const origin = getRequestOrigin(req);

  if (!origin) {
    if (shouldAllowMissingOrigin()) {
      return next();
    }

    return next(forbidden("Pedido bloqueado por falta de origem válida."));
  }

  if (!isAllowedOrigin(origin)) {
    return next(forbidden("Pedido bloqueado por origem não autorizada."));
  }

  return next();
}

module.exports = {
  originGuard,
};
