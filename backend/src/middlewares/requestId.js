// src/middlewares/requestId.js
const crypto = require("crypto");

const REQUEST_ID_HEADER = "X-Request-Id";
const MAX_REQUEST_ID_LENGTH = 128;

function createRequestId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString("hex");
}

function normalizeRequestId(value) {
  const requestId = String(value || "").trim();

  if (!requestId) return "";
  if (requestId.length > MAX_REQUEST_ID_LENGTH) return "";

  return requestId;
}

function requestId(req, res, next) {
  const incomingRequestId = normalizeRequestId(req.headers["x-request-id"]);
  const currentRequestId = incomingRequestId || createRequestId();

  req.requestId = currentRequestId;
  res.setHeader(REQUEST_ID_HEADER, currentRequestId);

  return next();
}

module.exports = {
  REQUEST_ID_HEADER,
  requestId,
};
