// src/features/santacasa/historico/utils/santaCasaHistoricoQuery.utils.js

const DEFAULT_STATUS = "TODOS";
const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 50;

function normalizeDateInput(value, mode = "start") {
  const text = String(value || "").trim();

  if (!text) return "";

  const parts = text.split("-").map(Number);

  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return text;
  }

  const [year, month, day] = parts;

  const date =
    mode === "end"
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

  return date.toISOString();
}

function normalizeStatus(status) {
  return String(status || DEFAULT_STATUS)
    .trim()
    .toUpperCase();
}

function normalizeSearch(search) {
  return String(search || "").trim();
}

function normalizeSkip(skip) {
  const normalizedSkip = Number(skip);

  if (!Number.isFinite(normalizedSkip)) return DEFAULT_SKIP;

  return Math.max(DEFAULT_SKIP, normalizedSkip);
}

function normalizeTake(take) {
  const normalizedTake = Number(take);

  if (!Number.isFinite(normalizedTake)) return DEFAULT_TAKE;

  return Math.max(1, normalizedTake);
}

export function buildSantaCasaHistoricoQuery({
  status = DEFAULT_STATUS,
  search = "",
  from = "",
  to = "",
  skip = DEFAULT_SKIP,
  take = DEFAULT_TAKE,
} = {}) {
  return {
    status: normalizeStatus(status),
    search: normalizeSearch(search),
    from: normalizeDateInput(from, "start"),
    to: normalizeDateInput(to, "end"),
    skip: normalizeSkip(skip),
    take: normalizeTake(take),
  };
}
