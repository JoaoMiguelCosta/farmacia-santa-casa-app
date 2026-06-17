// src/features/santacasa/historico/utils/santaCasaHistoricoQuery.utils.js

export const SANTACASA_HISTORICO_DEFAULT_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  page: 1,
  take: 10,
});

const ALLOWED_STATUSES = new Set([
  "TODOS",
  "VALIDADO",
  "REJEITADO",
  "CANCELADO",
]);

function getSafeSearchParams(searchParams) {
  if (searchParams instanceof URLSearchParams) {
    return searchParams;
  }

  return new URLSearchParams(searchParams);
}

function normalizeSearch(value) {
  return String(value || "").trim();
}

function normalizeDateParam(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue);

  return isValidDateFormat ? normalizedValue : "";
}

function normalizePositiveInteger(value, fallback) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(1, Math.floor(numberValue));
}

function normalizeDateForRequest(value, mode = "start") {
  const normalizedValue = normalizeDateParam(value);

  if (!normalizedValue) {
    return "";
  }

  const [year, month, day] = normalizedValue.split("-").map(Number);

  const date =
    mode === "end"
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

  return date.toISOString();
}

export function normalizeSantaCasaHistoricoStatus(status) {
  const normalizedStatus = String(
    status || SANTACASA_HISTORICO_DEFAULT_QUERY.status,
  )
    .trim()
    .toUpperCase();

  if (!ALLOWED_STATUSES.has(normalizedStatus)) {
    return SANTACASA_HISTORICO_DEFAULT_QUERY.status;
  }

  return normalizedStatus;
}

export function getSantaCasaHistoricoQueryFromSearchParams(searchParams) {
  const safeSearchParams = getSafeSearchParams(searchParams);

  const status = normalizeSantaCasaHistoricoStatus(
    safeSearchParams.get("status"),
  );

  const search = normalizeSearch(safeSearchParams.get("search"));

  const from = normalizeDateParam(safeSearchParams.get("from"));

  const to = normalizeDateParam(safeSearchParams.get("to"));

  const page = normalizePositiveInteger(
    safeSearchParams.get("page"),
    SANTACASA_HISTORICO_DEFAULT_QUERY.page,
  );

  const take = SANTACASA_HISTORICO_DEFAULT_QUERY.take;

  return {
    status,
    search,
    from,
    to,

    page,
    take,
    skip: (page - 1) * take,
  };
}

export function buildSantaCasaHistoricoSearchParams({
  currentSearchParams,

  status = SANTACASA_HISTORICO_DEFAULT_QUERY.status,

  search = SANTACASA_HISTORICO_DEFAULT_QUERY.search,

  from = SANTACASA_HISTORICO_DEFAULT_QUERY.from,

  to = SANTACASA_HISTORICO_DEFAULT_QUERY.to,

  page = SANTACASA_HISTORICO_DEFAULT_QUERY.page,
}) {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  const normalizedStatus = normalizeSantaCasaHistoricoStatus(status);

  const normalizedSearch = normalizeSearch(search);

  const normalizedFrom = normalizeDateParam(from);

  const normalizedTo = normalizeDateParam(to);

  const normalizedPage = normalizePositiveInteger(
    page,
    SANTACASA_HISTORICO_DEFAULT_QUERY.page,
  );

  if (normalizedStatus === SANTACASA_HISTORICO_DEFAULT_QUERY.status) {
    nextSearchParams.delete("status");
  } else {
    nextSearchParams.set("status", normalizedStatus);
  }

  if (normalizedSearch) {
    nextSearchParams.set("search", normalizedSearch);
  } else {
    nextSearchParams.delete("search");
  }

  if (normalizedFrom) {
    nextSearchParams.set("from", normalizedFrom);
  } else {
    nextSearchParams.delete("from");
  }

  if (normalizedTo) {
    nextSearchParams.set("to", normalizedTo);
  } else {
    nextSearchParams.delete("to");
  }

  if (normalizedPage > SANTACASA_HISTORICO_DEFAULT_QUERY.page) {
    nextSearchParams.set("page", String(normalizedPage));
  } else {
    nextSearchParams.delete("page");
  }

  return nextSearchParams;
}

export function buildSantaCasaHistoricoRequestQuery(query = {}) {
  const page = normalizePositiveInteger(
    query.page,
    SANTACASA_HISTORICO_DEFAULT_QUERY.page,
  );

  const take = SANTACASA_HISTORICO_DEFAULT_QUERY.take;

  return {
    status: normalizeSantaCasaHistoricoStatus(query.status),

    search: normalizeSearch(query.search),

    from: normalizeDateForRequest(query.from, "start"),

    to: normalizeDateForRequest(query.to, "end"),

    skip: (page - 1) * take,
    take,
  };
}
