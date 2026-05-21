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

const VALID_HISTORICO_STATUS = new Set([
  "TODOS",
  "VALIDADO",
  "REJEITADO",
  "CANCELADO",
]);

function normalizeStatus(status) {
  const normalizedStatus = String(status || "TODOS")
    .trim()
    .toUpperCase();

  return VALID_HISTORICO_STATUS.has(normalizedStatus)
    ? normalizedStatus
    : DEFAULT_HISTORICO_QUERY.status;
}

function buildHistoricoQuery(query = {}) {
  const status = normalizeStatus(query.status);

  return {
    search: String(query.search || "").trim(),
    from: query.from || "",
    to: query.to || "",
    skip: Math.max(0, Number(query.skip ?? DEFAULT_HISTORICO_QUERY.skip)),
    take: Math.min(
      Math.max(1, Number(query.take ?? DEFAULT_HISTORICO_QUERY.take)),
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
  return [...pedidos].sort((a, b) => {
    const dateA = new Date(getPedidoDecisionDate(a)).getTime();
    const dateB = new Date(getPedidoDecisionDate(b)).getTime();

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    const numeroA = Number(a?.numero) || 0;
    const numeroB = Number(b?.numero) || 0;

    return numeroB - numeroA;
  });
}

function normalizeHistoricoResponse(response, fallbackQuery) {
  const rows = Array.isArray(response?.rows) ? response.rows : [];

  return {
    data: sortPedidosFromNewestToOldest(rows),
    meta: {
      total: Number(response?.total) || 0,
      skip: Number(response?.params?.skip ?? fallbackQuery.skip) || 0,
      take: Number(response?.params?.take ?? fallbackQuery.take) || 50,
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
