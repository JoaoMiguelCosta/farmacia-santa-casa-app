import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const DEFAULT_PENDENTES_QUERY = Object.freeze({
  search: "",
  skip: 0,
  take: 50,
});

function buildPendentesQuery(query = {}) {
  return {
    search: String(query.search || "").trim(),
    skip: Math.max(0, Number(query.skip ?? DEFAULT_PENDENTES_QUERY.skip)),
    take: Math.min(
      Math.max(1, Number(query.take ?? DEFAULT_PENDENTES_QUERY.take)),
      200,
    ),
  };
}

function normalizePedidosResponse(response, fallbackQuery) {
  const rows = Array.isArray(response?.rows) ? response.rows : [];

  return {
    data: rows,
    meta: {
      total: Number(response?.total) || 0,
      skip: Number(response?.params?.skip ?? fallbackQuery.skip) || 0,
      take: Number(response?.params?.take ?? fallbackQuery.take) || 50,
    },
    params: {
      search: response?.params?.search ?? fallbackQuery.search,
      status: response?.params?.status ?? "PENDENTE",
    },
  };
}

export async function createPedido(payload) {
  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.pedidos,
    payload,
  );

  return response?.data ?? null;
}

export async function getPedidosPendentes(query = {}) {
  const finalQuery = buildPendentesQuery({
    ...DEFAULT_PENDENTES_QUERY,
    ...query,
  });

  const response = await httpClient.get(
    API_ENDPOINTS.santacasa.pedidosPendentes,
    {
      query: finalQuery,
    },
  );

  return normalizePedidosResponse(response, finalQuery);
}

export async function cancelPedido(pedidoId, payload = {}) {
  const response = await httpClient.post(
    API_ENDPOINTS.santacasa.cancelarPedido(pedidoId),
    payload,
  );

  return response?.data ?? null;
}
