// src/modules/admin-users/adminUsers.validators.js
const { badRequest } = require("../../shared/errors/AppError");

const USER_ROLES = Object.freeze(["SANTACASA", "FARMACIA", "ADMIN"]);

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 50;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_TAKE = 100;
const MAX_SEARCH_LENGTH = 160;
const MIN_PASSWORD_LENGTH = 10;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function parseIntegerQueryParam(value, fieldName, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed)) {
    throw badRequest(`O parâmetro '${fieldName}' deve ser um número válido.`);
  }

  return parsed;
}

function parseBooleanFilter(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["todos", "all"].includes(normalized)) {
    return undefined;
  }

  if (["1", "true", "yes", "on", "ativo", "active"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off", "inativo", "inactive"].includes(normalized)) {
    return false;
  }

  throw badRequest("O filtro 'isActive' deve ser booleano.");
}

function parseRoleFilter(value) {
  const role = normalizeText(value).toUpperCase();

  if (!role || role === "TODOS" || role === "ALL") {
    return null;
  }

  assertValidRole(role);

  return role;
}

function parseSearchFilter(value) {
  const search = normalizeText(value);

  if (search.length > MAX_SEARCH_LENGTH) {
    throw badRequest(
      `O parâmetro 'search' não pode exceder ${MAX_SEARCH_LENGTH} caracteres.`,
    );
  }

  return search || null;
}

function getPaginationParams(query = {}) {
  const hasSkipOrTake = query.skip !== undefined || query.take !== undefined;

  if (hasSkipOrTake) {
    const skip = Math.max(
      0,
      parseIntegerQueryParam(query.skip, "skip", DEFAULT_SKIP),
    );

    const rawTake = parseIntegerQueryParam(query.take, "take", DEFAULT_TAKE);
    const take = Math.min(Math.max(1, rawTake), MAX_TAKE);

    return {
      skip,
      take,
    };
  }

  const page = Math.max(
    1,
    parseIntegerQueryParam(query.page, "page", DEFAULT_PAGE),
  );

  const rawPageSize = parseIntegerQueryParam(
    query.pageSize,
    "pageSize",
    DEFAULT_PAGE_SIZE,
  );

  const pageSize = Math.min(Math.max(1, rawPageSize), MAX_TAKE);

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

function assertValidEmail(email) {
  if (!email) {
    throw badRequest("Email obrigatório.");
  }

  if (!EMAIL_PATTERN.test(email)) {
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

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw badRequest(
      `A password deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }
}

function parseListUsersQuery(query = {}) {
  const { skip, take } = getPaginationParams(query);

  return {
    search: parseSearchFilter(query.search),
    role: parseRoleFilter(query.role),
    isActive: parseBooleanFilter(query.isActive),
    skip,
    take,
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
