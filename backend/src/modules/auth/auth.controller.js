// src/modules/auth/auth.controller.js
const service = require("./auth.service");
const { AUTH_CONFIG } = require("../../config/auth.config");
const { parseLoginPayload } = require("./auth.validators");

async function login(req, res) {
  const payload = parseLoginPayload(req.body);
  const { token, user } = await service.login(payload);

  res.cookie(AUTH_CONFIG.cookie.name, token, AUTH_CONFIG.cookie.options);

  return res.status(200).json({
    user,
  });
}

async function logout(_req, res) {
  res.clearCookie(AUTH_CONFIG.cookie.name, {
    ...AUTH_CONFIG.cookie.options,
    maxAge: undefined,
  });

  return res.status(200).json({
    ok: true,
  });
}

async function me(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}

module.exports = {
  login,
  logout,
  me,
};
