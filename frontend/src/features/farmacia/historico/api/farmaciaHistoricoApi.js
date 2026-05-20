import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const DEFAULT_HISTORICO_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 50,
});

const MAX_TAKE = 200;

function normalizeHistoricoQuery(query = {}) {
  return {
    status: String(query.status || DEFAULT_HISTORICO_QUERY.status)
      .trim()
      .toUpperCase(),
    search: String(query.search || "").trim(),
    from: String(query.from || "").trim(),
    to: String(query.to || "").trim(),
    skip: Math.max(0, Number(query.skip ?? DEFAULT_HISTORICO_QUERY.skip)),
    take: Math.min(
      Math.max(1, Number(query.take ?? DEFAULT_HISTORICO_QUERY.take)),
      MAX_TAKE,
    ),
  };
}

function normalizeHistoricoResponse(response, fallbackQuery) {
  const data = Array.isArray(response?.data) ? response.data : [];

  return {
    data,
    meta: {
      total: Number(response?.meta?.total) || 0,
      skip: Number(response?.meta?.skip ?? fallbackQuery.skip) || 0,
      take: Number(response?.meta?.take ?? fallbackQuery.take) || 50,
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
