// src/modules/manutencao/manutencao.validators.js
const { badRequest } = require("../../shared/errors/AppError");
const { env } = require("../../config/env");

const JOB_CONFIRMATIONS = Object.freeze({
  receitaExpiry: "RUN_RECEITA_EXPIRY",
  higiene: "RUN_HIGIENE",
  purgeHistory: "RUN_PURGE_HISTORY",
});

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

function parseConfirm(value, expectedValue) {
  const confirm = String(value || "").trim();

  if (confirm !== expectedValue) {
    throw badRequest(`Confirmação inválida. Envia confirm="${expectedValue}".`);
  }

  return confirm;
}

function assertBackupConfirmed(value) {
  const backupConfirmed = parseBoolean(value, false);

  if (!backupConfirmed) {
    throw badRequest(
      "Para executar purge-history, confirma backupConfirmed=true.",
    );
  }
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

function parseReceitaExpiryRunPayload(source = {}) {
  parseConfirm(source.confirm, JOB_CONFIRMATIONS.receitaExpiry);

  return {};
}

function parseHigieneRunOptions(source = {}) {
  parseConfirm(source.confirm, JOB_CONFIRMATIONS.higiene);

  return parseHigieneOptions(source);
}

function parsePurgeRunOptions(source = {}) {
  parseConfirm(source.confirm, JOB_CONFIRMATIONS.purgeHistory);
  assertBackupConfirmed(source.backupConfirmed);

  return parsePurgeOptions(source);
}

module.exports = {
  JOB_CONFIRMATIONS,
  parseHigieneOptions,
  parseHigieneRunOptions,
  parsePurgeOptions,
  parsePurgeRunOptions,
  parseReceitaExpiryRunPayload,
};
