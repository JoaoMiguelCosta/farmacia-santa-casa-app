// src/modules/farmacia/farmacia.validators.js
const { badRequest } = require("../../shared/errors/AppError");

const ALLOWED_STATUS = new Set([
  "PENDENTE",
  "VALIDADO",
  "REJEITADO",
  "CANCELADO",
]);

function parseListPedidosQuery(query = {}) {
  const status = String(query.status || "PENDENTE")
    .trim()
    .toUpperCase();

  const skip = Math.max(0, Number(query.skip || 0));
  const take = Math.min(Math.max(1, Number(query.take || 50)), 200);

  return {
    status: ALLOWED_STATUS.has(status) ? status : "PENDENTE",
    skip,
    take,
  };
}

function parseRejeitarPayload(payload = {}) {
  const motivo = String(payload.motivo || payload.reason || "").trim();

  if (motivo.length > 500) {
    throw badRequest("O motivo da rejeição não pode exceder 500 caracteres.");
  }

  return {
    motivo: motivo || null,
  };
}

function parseValidarPayload(payload = {}) {
  const validatedById = payload.validatedById
    ? String(payload.validatedById).trim()
    : null;

  return {
    validatedById,
  };
}

module.exports = {
  parseListPedidosQuery,
  parseRejeitarPayload,
  parseValidarPayload,
};
