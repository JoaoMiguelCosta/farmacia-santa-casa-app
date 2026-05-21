// src/modules/regularizacoes/regularizacoes.validators.js
const { badRequest } = require("../../shared/errors/AppError");

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 50;
const MAX_TAKE = 200;
const MAX_SEARCH_LENGTH = 160;

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

function parseDateQueryParam(value, fieldName, mode = "start") {
  const rawValue = String(value || "").trim();

  if (!rawValue) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawValue);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch.map(Number);

    return mode === "end"
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw badRequest(`O parâmetro '${fieldName}' deve ser uma data válida.`);
  }

  return parsedDate;
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

function parseRegularizacoesQuery(query = {}) {
  const skip = Math.max(
    0,
    parseIntegerQueryParam(query.skip, "skip", DEFAULT_SKIP),
  );

  const rawTake = parseIntegerQueryParam(query.take, "take", DEFAULT_TAKE);
  const take = Math.min(Math.max(1, rawTake), MAX_TAKE);

  const utenteId = query.utenteId ? String(query.utenteId).trim() : null;

  const medicamento = query.medicamento
    ? String(query.medicamento).trim()
    : null;

  return {
    skip,
    take,
    utenteId,
    medicamento,

    search: parseSearchQuery(query.search),
    from: parseDateQueryParam(query.from, "from", "start"),
    to: parseDateQueryParam(query.to, "to", "end"),
  };
}

module.exports = {
  parseRegularizacoesQuery,
};
