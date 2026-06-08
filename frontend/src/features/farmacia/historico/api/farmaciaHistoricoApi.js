// src/features/farmacia/historico/api/farmaciaHistoricoApi.js
import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const DEFAULT_HISTORICO_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 10,
});

const MAX_TAKE = 200;

function getSafeNumber(
  value,
  fallback,
  { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {},
) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, parsedValue));
}

function normalizeHistoricoQuery(query = {}) {
  return {
    status: String(query.status || DEFAULT_HISTORICO_QUERY.status)
      .trim()
      .toUpperCase(),

    search: String(query.search || "").trim(),

    from: String(query.from || "").trim(),
    to: String(query.to || "").trim(),

    skip: getSafeNumber(query.skip, DEFAULT_HISTORICO_QUERY.skip, {
      minimum: 0,
    }),

    take: getSafeNumber(query.take, DEFAULT_HISTORICO_QUERY.take, {
      minimum: 1,
      maximum: MAX_TAKE,
    }),
  };
}

function normalizeHistoricoResponse(response, fallbackQuery) {
  const data = Array.isArray(response?.data) ? response.data : [];

  return {
    data,

    meta: {
      total: getSafeNumber(response?.meta?.total, 0, {
        minimum: 0,
      }),

      skip: getSafeNumber(response?.meta?.skip, fallbackQuery.skip, {
        minimum: 0,
      }),

      take: getSafeNumber(response?.meta?.take, fallbackQuery.take, {
        minimum: 1,
        maximum: MAX_TAKE,
      }),
    },

    params: {
      status: response?.params?.status ?? fallbackQuery.status,

      search: response?.params?.search ?? fallbackQuery.search,

      from: response?.params?.from ?? fallbackQuery.from,

      to: response?.params?.to ?? fallbackQuery.to,
    },
  };
}

export async function getFarmaciaHistorico(query = {}) {
  const finalQuery = normalizeHistoricoQuery({
    ...DEFAULT_HISTORICO_QUERY,
    ...query,
  });

  const response = await httpClient.get(API_ENDPOINTS.farmacia.pedidos, {
    query: finalQuery,
  });

  return normalizeHistoricoResponse(response, finalQuery);
}
