// src/modules/admin-users/adminUsers.validators.js
const { badRequest } = require("../../shared/errors/AppError");

const USER_ROLES = Object.freeze(["SANTACASA", "FARMACIA", "ADMIN"]);

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parseBooleanFilter(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["1", "true", "yes", "on", "ativo", "active"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off", "inativo", "inactive"].includes(normalized)) {
    return false;
  }

  throw badRequest("O filtro 'isActive' deve ser booleano.");
}

function assertValidEmail(email) {
  if (!email) {
    throw badRequest("Email obrigatório.");
  }

  if (!email.includes("@")) {
    throw badRequest("Email inválido.");
  }
}

function assertValidRole(role) {
  if (!USER_ROLES.includes(role)) {
    throw badRequest("Role inválida.");
  }
}

function assertValidPassword(password) {
  if (!password) {
    throw badRequest("Password obrigatória.");
  }

  if (password.length < 8) {
    throw badRequest("A password deve ter pelo menos 8 caracteres.");
  }
}

function parseListUsersQuery(query = {}) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInteger(
    query.pageSize,
    DEFAULT_PAGE_SIZE,
  );

  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);

  const search = normalizeText(query.search);
  const role = normalizeText(query.role).toUpperCase();
  const isActive = parseBooleanFilter(query.isActive);

  if (role) {
    assertValidRole(role);
  }

  return {
    search: search || null,
    role: role || null,
    isActive,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

function parseCreateUserPayload(body = {}) {
  const name = normalizeText(body.name);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const role = normalizeText(body.role).toUpperCase();

  if (!name) {
    throw badRequest("Nome obrigatório.");
  }

  assertValidEmail(email);
  assertValidPassword(password);
  assertValidRole(role);

  return {
    name,
    email,
    password,
    role,
  };
}

function parseUpdateUserPayload(body = {}) {
  const name = normalizeText(body.name);
  const email = normalizeEmail(body.email);
  const role = normalizeText(body.role).toUpperCase();

  if (!name) {
    throw badRequest("Nome obrigatório.");
  }

  assertValidEmail(email);
  assertValidRole(role);

  return {
    name,
    email,
    role,
  };
}

function parseUpdatePasswordPayload(body = {}) {
  const password = String(body.password || "");

  assertValidPassword(password);

  return {
    password,
  };
}

function parseUpdateStatusPayload(body = {}) {
  if (typeof body.isActive !== "boolean") {
    throw badRequest("O campo 'isActive' deve ser booleano.");
  }

  return {
    isActive: body.isActive,
  };
}

module.exports = {
  USER_ROLES,
  parseListUsersQuery,
  parseCreateUserPayload,
  parseUpdateUserPayload,
  parseUpdatePasswordPayload,
  parseUpdateStatusPayload,
};
