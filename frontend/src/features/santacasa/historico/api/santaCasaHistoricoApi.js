// src/features/santacasa/historico/api/santaCasaHistoricoApi.js

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

const VALID_HISTORICO_STATUS = new Set([
  "TODOS",
  "VALIDADO",
  "REJEITADO",
  "CANCELADO",
]);

function normalizeStatus(status) {
  const normalizedStatus = String(status || DEFAULT_HISTORICO_QUERY.status)
    .trim()
    .toUpperCase();

  return VALID_HISTORICO_STATUS.has(normalizedStatus)
    ? normalizedStatus
    : DEFAULT_HISTORICO_QUERY.status;
}

function normalizeNonNegativeInteger(value, fallback) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, Math.floor(numberValue));
}

function normalizePositiveInteger(value, fallback) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(1, Math.floor(numberValue));
}

function buildHistoricoQuery(query = {}) {
  const status = normalizeStatus(query.status);

  return {
    search: String(query.search || "").trim(),

    from: query.from || "",
    to: query.to || "",

    skip: normalizeNonNegativeInteger(query.skip, DEFAULT_HISTORICO_QUERY.skip),

    take: Math.min(
      normalizePositiveInteger(query.take, DEFAULT_HISTORICO_QUERY.take),
      200,
    ),

    ...(status !== "TODOS" ? { status } : {}),
  };
}

function getPedidoDecisionDate(pedido) {
  return (
    pedido?.validatedAt ||
    pedido?.rejectedAt ||
    pedido?.updatedAt ||
    pedido?.createdAt ||
    ""
  );
}

function sortPedidosFromNewestToOldest(pedidos = []) {
  return [...pedidos].sort((firstPedido, secondPedido) => {
    const firstDate = new Date(getPedidoDecisionDate(firstPedido)).getTime();

    const secondDate = new Date(getPedidoDecisionDate(secondPedido)).getTime();

    if (firstDate !== secondDate) {
      return secondDate - firstDate;
    }

    const firstNumero = Number(firstPedido?.numero) || 0;

    const secondNumero = Number(secondPedido?.numero) || 0;

    return secondNumero - firstNumero;
  });
}

function normalizeHistoricoResponse(response, fallbackQuery) {
  const rows = Array.isArray(response?.rows) ? response.rows : [];

  const responseSkip = Number(response?.params?.skip);

  const responseTake = Number(response?.params?.take);

  return {
    data: sortPedidosFromNewestToOldest(rows),

    meta: {
      total: Math.max(0, Number(response?.total) || 0),

      skip:
        Number.isFinite(responseSkip) && responseSkip >= 0
          ? responseSkip
          : fallbackQuery.skip,

      take:
        Number.isFinite(responseTake) && responseTake > 0
          ? responseTake
          : fallbackQuery.take,
    },

    params: {
      search: response?.params?.search ?? fallbackQuery.search,

      status: response?.params?.status ?? fallbackQuery.status,

      from: response?.params?.from ?? fallbackQuery.from,

      to: response?.params?.to ?? fallbackQuery.to,
    },
  };
}

export async function getSantaCasaHistorico(query = {}) {
  const finalQuery = buildHistoricoQuery({
    ...DEFAULT_HISTORICO_QUERY,
    ...query,
  });

  const response = await httpClient.get(
    API_ENDPOINTS.santacasa.pedidosHistorico,
    {
      query: finalQuery,
    },
  );

  return normalizeHistoricoResponse(response, finalQuery);
}

export async function getSantaCasaHistoricoPedidoById(pedidoId) {
  const normalizedPedidoId = String(pedidoId || "").trim();

  if (!normalizedPedidoId) {
    throw new Error("ID do pedido em falta.");
  }

  const response = await httpClient.get(
    API_ENDPOINTS.santacasa.pedidoById(normalizedPedidoId),
  );

  return response?.data ?? null;
}
