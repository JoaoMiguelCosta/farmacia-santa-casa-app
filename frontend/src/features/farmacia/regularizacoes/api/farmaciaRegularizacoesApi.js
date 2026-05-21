import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const DEFAULT_REGULARIZACOES_QUERY = Object.freeze({
  search: "",
  medicamento: "",
  from: "",
  to: "",
  skip: 0,
  take: 50,
});

const MAX_TAKE = 200;

function normalizeRegularizacoesQuery(query = {}) {
  return {
    search: String(query.search || "").trim(),
    medicamento: String(query.medicamento || "").trim(),
    from: String(query.from || "").trim(),
    to: String(query.to || "").trim(),
    skip: Math.max(0, Number(query.skip ?? DEFAULT_REGULARIZACOES_QUERY.skip)),
    take: Math.min(
      Math.max(1, Number(query.take ?? DEFAULT_REGULARIZACOES_QUERY.take)),
      MAX_TAKE,
    ),
  };
}

function normalizeRegularizacoesResponse(
  response,
  fallbackQuery = DEFAULT_REGULARIZACOES_QUERY,
) {
  return {
    data: Array.isArray(response?.data) ? response.data : [],
    meta: {
      total: Number(response?.meta?.total) || 0,
      skip: Number(response?.meta?.skip ?? fallbackQuery.skip) || 0,
      take: Number(response?.meta?.take ?? fallbackQuery.take) || 50,
    },
    params: {
      search: response?.params?.search ?? fallbackQuery.search,
      medicamento: response?.params?.medicamento ?? fallbackQuery.medicamento,
      from: response?.params?.from ?? fallbackQuery.from,
      to: response?.params?.to ?? fallbackQuery.to,
    },
  };
}

export async function getFarmaciaRegularizacoesPendentes(query = {}) {
  const finalQuery = normalizeRegularizacoesQuery({
    ...DEFAULT_REGULARIZACOES_QUERY,
    ...query,
  });

  const response = await httpClient.get(
    API_ENDPOINTS.farmacia.regularizacoesPendentes,
    {
      query: finalQuery,
    },
  );

  return normalizeRegularizacoesResponse(response, finalQuery);
}

export async function getFarmaciaRegularizacoesHistorico(query = {}) {
  const finalQuery = normalizeRegularizacoesQuery({
    ...DEFAULT_REGULARIZACOES_QUERY,
    ...query,
  });

  const response = await httpClient.get(
    API_ENDPOINTS.farmacia.regularizacoesHistorico,
    {
      query: finalQuery,
    },
  );

  return normalizeRegularizacoesResponse(response, finalQuery);
}

export async function getFarmaciaRegularizacoesSignal() {
  return httpClient.get(API_ENDPOINTS.farmacia.regularizacoesSinal);
}
