// src/modules/auth/auth.validators.js
const { badRequest } = require("../../shared/errors/AppError");

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function parseLoginPayload(body = {}) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!email) {
    throw badRequest("Email obrigatório.");
  }

  if (!email.includes("@")) {
    throw badRequest("Email inválido.");
  }

  if (!password) {
    throw badRequest("Password obrigatória.");
  }

  return {
    email,
    password,
  };
}

module.exports = {
  parseLoginPayload,
};
