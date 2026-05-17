// src/modules/auth/auth.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const repository = require("./auth.repository");
const { AUTH_CONFIG } = require("../../config/auth.config");
const { unauthorized } = require("../../shared/errors/AppError");

function buildPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    AUTH_CONFIG.jwt.secret,
    {
      expiresIn: AUTH_CONFIG.jwt.expiresIn,
    },
  );
}

function verifyAuthToken(token) {
  try {
    return jwt.verify(token, AUTH_CONFIG.jwt.secret);
  } catch {
    throw unauthorized("Sessão inválida ou expirada.");
  }
}

function getTokenFromRequest(req) {
  return req.cookies?.[AUTH_CONFIG.cookie.name] || "";
}

async function login({ email, password }) {
  const user = await repository.findUserByEmail(email);

  if (!user || !user.isActive) {
    throw unauthorized("Credenciais inválidas.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw unauthorized("Credenciais inválidas.");
  }

  const token = signAuthToken(user);

  return {
    token,
    user: buildPublicUser(user),
  };
}

async function getCurrentUserFromRequest(req) {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw unauthorized("Sessão em falta.");
  }

  const payload = verifyAuthToken(token);

  const user = await repository.findActiveUserById(payload.sub);

  if (!user) {
    throw unauthorized("Utilizador inválido ou inativo.");
  }

  return buildPublicUser(user);
}

module.exports = {
  login,
  getCurrentUserFromRequest,
};
