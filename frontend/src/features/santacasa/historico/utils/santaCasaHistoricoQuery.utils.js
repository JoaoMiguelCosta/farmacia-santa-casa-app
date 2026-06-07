// src/features/santacasa/historico/utils/santaCasaHistoricoQuery.utils.js

const DEFAULT_STATUS = "TODOS";
const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 50;

const ALLOWED_STATUSES = new Set([
  "TODOS",
  "VALIDADO",
  "REJEITADO",
  "CANCELADO",
]);

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

export function normalizeSantaCasaHistoricoStatus(status) {
  const normalizedStatus = String(status || DEFAULT_STATUS)
    .trim()
    .toUpperCase();

  if (!ALLOWED_STATUSES.has(normalizedStatus)) {
    return DEFAULT_STATUS;
  }

  return normalizedStatus;
}

function normalizeSearch(search) {
  return String(search || "").trim();
}

function normalizeSkip(skip) {
  const normalizedSkip = Number(skip);

  if (!Number.isFinite(normalizedSkip)) {
    return DEFAULT_SKIP;
  }

  return Math.max(DEFAULT_SKIP, normalizedSkip);
}

function normalizeTake(take) {
  const normalizedTake = Number(take);

  if (!Number.isFinite(normalizedTake)) {
    return DEFAULT_TAKE;
  }

  return Math.max(1, normalizedTake);
}

export function getSantaCasaHistoricoStatusFromSearchParams(searchParams) {
  const safeSearchParams =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams);

  return normalizeSantaCasaHistoricoStatus(safeSearchParams.get("status"));
}

export function buildSantaCasaHistoricoSearchParams({
  currentSearchParams,
  status,
}) {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  const normalizedStatus = normalizeSantaCasaHistoricoStatus(status);

  if (normalizedStatus === DEFAULT_STATUS) {
    nextSearchParams.delete("status");
  } else {
    nextSearchParams.set("status", normalizedStatus);
  }

  return nextSearchParams;
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
    status: normalizeSantaCasaHistoricoStatus(status),
    search: normalizeSearch(search),
    from: normalizeDateInput(from, "start"),
    to: normalizeDateInput(to, "end"),
    skip: normalizeSkip(skip),
    take: normalizeTake(take),
  };
}
