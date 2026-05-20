// src/modules/utentes/utentes.validators.js
const { badRequest } = require("../../shared/errors/AppError");

const UTENTE_LIST_STATUSES = new Set(["ATIVO", "ARQUIVADO", "TODOS"]);

const DEFAULT_LIST_SKIP = 0;
const DEFAULT_LIST_TAKE = 50;
const MAX_LIST_TAKE = 100;
const MAX_SEARCH_LENGTH = 120;

function validateCreateUtentePayload(payload = {}) {
  const numero9 = String(payload.numero9 || "").trim();
  const nome = String(payload.nome || "").trim();

  if (!/^\d{9}$/.test(numero9)) {
    throw badRequest("O campo 'numero9' deve ter exatamente 9 dígitos.");
  }

  if (!nome) {
    throw badRequest("O campo 'nome' é obrigatório.");
  }

  return {
    numero9,
    nome,
  };
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

function parseSearchQuery(value) {
  const search = String(value || "").trim();

  if (search.length > MAX_SEARCH_LENGTH) {
    throw badRequest(
      `O parâmetro 'search' não pode exceder ${MAX_SEARCH_LENGTH} caracteres.`,
    );
  }

  return search;
}

function parseListUtentesQuery(query = {}) {
  const status = String(query.status || "ATIVO")
    .trim()
    .toUpperCase();

  if (!UTENTE_LIST_STATUSES.has(status)) {
    throw badRequest("O filtro 'status' deve ser ATIVO, ARQUIVADO ou TODOS.");
  }

  const skip = Math.max(
    0,
    parseIntegerQueryParam(query.skip, "skip", DEFAULT_LIST_SKIP),
  );

  const rawTake = parseIntegerQueryParam(query.take, "take", DEFAULT_LIST_TAKE);
  const take = Math.min(Math.max(1, rawTake), MAX_LIST_TAKE);

  return {
    status,
    search: parseSearchQuery(query.search),
    skip,
    take,
  };
}

function validateArchiveUtentePayload(payload = {}) {
  const archivedReason = String(
    payload.archivedReason || payload.reason || "",
  ).trim();

  if (archivedReason.length > 500) {
    throw badRequest("O motivo do arquivo não pode exceder 500 caracteres.");
  }

  return {
    archivedReason: archivedReason || null,
  };
}

module.exports = {
  validateCreateUtentePayload,
  parseListUtentesQuery,
  validateArchiveUtentePayload,
};
