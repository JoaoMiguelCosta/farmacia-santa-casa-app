// src/features/farmacia/pedidos/api/farmaciaPedidosApi.js
import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const DEFAULT_PEDIDOS_QUERY = Object.freeze({
  status: "PENDENTE",
  skip: 0,
  take: 50,
});

function normalizePedidosResponse(
  response,
  fallbackQuery = DEFAULT_PEDIDOS_QUERY,
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

export async function getFarmaciaPedidos(query = {}) {
  const finalQuery = {
    ...DEFAULT_PEDIDOS_QUERY,
    ...query,
  };

  const response = await httpClient.get(API_ENDPOINTS.farmacia.pedidos, {
    query: finalQuery,
  });

  return normalizePedidosResponse(response, finalQuery);
}

export async function getFarmaciaPedidoById(pedidoId) {
  if (!pedidoId) {
    throw new Error("ID do pedido em falta.");
  }

  const response = await httpClient.get(
    API_ENDPOINTS.farmacia.pedidoById(pedidoId),
  );

  return response?.data ?? null;
}

export async function validarFarmaciaPedido(pedidoId, payload = {}) {
  if (!pedidoId) {
    throw new Error("ID do pedido em falta.");
  }

  const response = await httpClient.post(
    API_ENDPOINTS.farmacia.validarPedido(pedidoId),
    payload,
  );

  return response?.data ?? null;
}

export async function rejeitarFarmaciaPedido(pedidoId, payload = {}) {
  if (!pedidoId) {
    throw new Error("ID do pedido em falta.");
  }

  const response = await httpClient.post(
    API_ENDPOINTS.farmacia.rejeitarPedido(pedidoId),
    payload,
  );

  return response?.data ?? null;
}
