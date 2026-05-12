// src/modules/manutencao/manutencao.validators.js
const { unauthorized, badRequest } = require("../../shared/errors/AppError");
const { env } = require("../../config/env");

function assertMaintenanceKey(req) {
  const receivedKey = String(req.headers["x-maintenance-key"] || "").trim();

  if (!env.MAINTENANCE_API_KEY) {
    throw unauthorized("Manutenção indisponível: chave não configurada.");
  }

  if (receivedKey !== env.MAINTENANCE_API_KEY) {
    throw unauthorized("Chave de manutenção inválida.");
  }
}

function parseOffsetMonths(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw badRequest("O parâmetro 'offsetMonths' deve ser um número válido.");
  }

  return parsed;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return fallback;
}

function parseHigieneOptions(source = {}) {
  return {
    offsetMonths: parseOffsetMonths(
      source.offsetMonths,
      env.HIGIENE_OFFSET_MONTHS,
    ),
    anonymize: parseBoolean(source.anonymize, env.HIGIENE_ANONYMIZE),
  };
}

function parsePurgeOptions(source = {}) {
  return {
    offsetMonths: parseOffsetMonths(
      source.offsetMonths,
      env.PURGE_OFFSET_MONTHS,
    ),
  };
}

module.exports = {
  assertMaintenanceKey,
  parseHigieneOptions,
  parsePurgeOptions,
};
