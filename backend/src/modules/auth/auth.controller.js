// src/modules/auth/auth.controller.js
const service = require("./auth.service");
const { AUTH_CONFIG } = require("../../config/auth.config");
const { ok } = require("../../shared/utils/http");

async function login(req, res) {
  const data = await service.login(req.body);

  res.cookie(AUTH_CONFIG.cookie.name, data.token, AUTH_CONFIG.cookie.options);

  return ok(res, {
    user: data.user,
  });
}

async function logout(_req, res) {
  res.clearCookie(AUTH_CONFIG.cookie.name, AUTH_CONFIG.cookie.clearOptions);

  return ok(res, {
    message: "Sessão terminada com sucesso.",
  });
}

async function me(req, res) {
  const user = await service.getCurrentUserFromRequest(req);

  return ok(res, {
    user,
  });
}

module.exports = {
  login,
  logout,
  me,
};
