// src/modules/utentes/utentes.validators.js
const { badRequest } = require("../../shared/errors/AppError");

const UTENTE_LIST_STATUSES = new Set(["ATIVO", "ARQUIVADO", "TODOS"]);

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

function parseListUtentesQuery(query = {}) {
  const status = String(query.status || "ATIVO")
    .trim()
    .toUpperCase();

  if (!UTENTE_LIST_STATUSES.has(status)) {
    throw badRequest("O filtro 'status' deve ser ATIVO, ARQUIVADO ou TODOS.");
  }

  return {
    status,
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
