import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const DEFAULT_REGULARIZACOES_QUERY = Object.freeze({
  skip: 0,
  take: 50,
});

function normalizeRegularizacoesResponse(
  response,
  fallbackQuery = DEFAULT_REGULARIZACOES_QUERY,
) {
  return {
    data: Array.isArray(response?.data) ? response.data : [],
    meta: response?.meta ?? {
      total: 0,
      skip: fallbackQuery.skip ?? 0,
      take: fallbackQuery.take ?? 50,
    },
  };
}

export async function getFarmaciaRegularizacoesPendentes(query = {}) {
  const finalQuery = {
    ...DEFAULT_REGULARIZACOES_QUERY,
    ...query,
  };

  const response = await httpClient.get(
    API_ENDPOINTS.farmacia.regularizacoesPendentes,
    {
      query: finalQuery,
    },
  );

  return normalizeRegularizacoesResponse(response, finalQuery);
}

export async function getFarmaciaRegularizacoesHistorico(query = {}) {
  const finalQuery = {
    ...DEFAULT_REGULARIZACOES_QUERY,
    ...query,
  };

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
