// src/middlewares/authMiddleware.js
const authService = require("../modules/auth/auth.service");
const { unauthorized, forbidden } = require("../shared/errors/AppError");

function normalizeRoles(roles = []) {
  if (Array.isArray(roles)) return roles;

  return [roles].filter(Boolean);
}

function requireAuth(req, _res, next) {
  authService
    .getCurrentUserFromRequest(req)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
}

function requireRole(allowedRoles = []) {
  const roles = normalizeRoles(allowedRoles);

  return function roleMiddleware(req, _res, next) {
    if (!req.user) {
      throw unauthorized("Autenticação obrigatória.");
    }

    if (roles.length === 0) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      throw forbidden("Sem permissão para aceder a este recurso.");
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
