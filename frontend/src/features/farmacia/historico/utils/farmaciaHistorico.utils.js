// src/features/farmacia/historico/utils/farmaciaHistorico.utils.js
const DEFAULT_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 10,
});

const MAX_TAKE = 200;

const ALLOWED_STATUSES = new Set(["TODOS", "VALIDADO", "REJEITADO"]);

const SEARCH_PARAM_KEYS = Object.freeze({
  status: "status",
  search: "search",
  from: "from",
  to: "to",
  page: "page",
});

function getSafeInteger(
  value,
  fallback,
  { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {},
) {
  const parsedValue = Math.floor(Number(value));

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, parsedValue));
}

function normalizeStatus(status) {
  const normalizedStatus = String(status || DEFAULT_QUERY.status)
    .trim()
    .toUpperCase();

  if (!ALLOWED_STATUSES.has(normalizedStatus)) {
    return DEFAULT_QUERY.status;
  }

  return normalizedStatus;
}

function getSearchParams(searchParams) {
  if (searchParams instanceof URLSearchParams) {
    return searchParams;
  }

  return new URLSearchParams(String(searchParams || ""));
}

export function buildFarmaciaHistoricoQuery({
  status = DEFAULT_QUERY.status,
  search = DEFAULT_QUERY.search,
  from = DEFAULT_QUERY.from,
  to = DEFAULT_QUERY.to,
  skip = DEFAULT_QUERY.skip,
  take = DEFAULT_QUERY.take,
} = {}) {
  return {
    status: normalizeStatus(status),

    search: String(search || "").trim(),
    from: String(from || "").trim(),
    to: String(to || "").trim(),

    skip: getSafeInteger(skip, DEFAULT_QUERY.skip, {
      minimum: 0,
    }),

    take: getSafeInteger(take, DEFAULT_QUERY.take, {
      minimum: 1,
      maximum: MAX_TAKE,
    }),
  };
}

export function getFarmaciaHistoricoQueryFromSearchParams(
  searchParams,
  fallbackQuery = DEFAULT_QUERY,
) {
  const params = getSearchParams(searchParams);

  const normalizedFallbackQuery = buildFarmaciaHistoricoQuery({
    ...DEFAULT_QUERY,
    ...fallbackQuery,
  });

  const fallbackPage =
    Math.floor(normalizedFallbackQuery.skip / normalizedFallbackQuery.take) + 1;

  const page = getSafeInteger(
    params.get(SEARCH_PARAM_KEYS.page),
    fallbackPage,
    {
      minimum: 1,
    },
  );

  return buildFarmaciaHistoricoQuery({
    status:
      params.get(SEARCH_PARAM_KEYS.status) || normalizedFallbackQuery.status,

    search:
      params.get(SEARCH_PARAM_KEYS.search) ?? normalizedFallbackQuery.search,

    from: params.get(SEARCH_PARAM_KEYS.from) ?? normalizedFallbackQuery.from,

    to: params.get(SEARCH_PARAM_KEYS.to) ?? normalizedFallbackQuery.to,

    skip: (page - 1) * normalizedFallbackQuery.take,

    take: normalizedFallbackQuery.take,
  });
}

export function buildFarmaciaHistoricoSearchParams(query = DEFAULT_QUERY) {
  const normalizedQuery = buildFarmaciaHistoricoQuery({
    ...DEFAULT_QUERY,
    ...query,
  });

  const searchParams = new URLSearchParams();

  if (normalizedQuery.status !== DEFAULT_QUERY.status) {
    searchParams.set(SEARCH_PARAM_KEYS.status, normalizedQuery.status);
  }

  if (normalizedQuery.search) {
    searchParams.set(SEARCH_PARAM_KEYS.search, normalizedQuery.search);
  }

  if (normalizedQuery.from) {
    searchParams.set(SEARCH_PARAM_KEYS.from, normalizedQuery.from);
  }

  if (normalizedQuery.to) {
    searchParams.set(SEARCH_PARAM_KEYS.to, normalizedQuery.to);
  }

  const page = Math.floor(normalizedQuery.skip / normalizedQuery.take) + 1;

  if (page > 1) {
    searchParams.set(SEARCH_PARAM_KEYS.page, String(page));
  }

  return searchParams;
}
