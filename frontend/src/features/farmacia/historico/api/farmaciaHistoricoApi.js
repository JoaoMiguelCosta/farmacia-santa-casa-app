import { API_ENDPOINTS } from "../../../../shared/api/endpoints";
import { httpClient } from "../../../../shared/api/httpClient";

const HISTORICO_STATUS = Object.freeze(["VALIDADO", "REJEITADO"]);

const DEFAULT_HISTORICO_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 50,
});

const HISTORICO_FETCH_TAKE = 200;

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

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
      HISTORICO_FETCH_TAKE,
    ),
  };
}

function getPedidoSortDate(pedido) {
  return (
    pedido?.validatedAt ||
    pedido?.rejectedAt ||
    pedido?.updatedAt ||
    pedido?.createdAt ||
    ""
  );
}

function sortHistoricoPedidos(pedidos = []) {
  return [...pedidos].sort((a, b) => {
    const dateA = new Date(getPedidoSortDate(a)).getTime();
    const dateB = new Date(getPedidoSortDate(b)).getTime();

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    const numeroA = Number(a?.numero) || 0;
    const numeroB = Number(b?.numero) || 0;

    return numeroB - numeroA;
  });
}

function getDateBoundary(value, mode = "start") {
  if (!value) return null;

  const parts = String(value).split("-").map(Number);

  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    const fallbackDate = new Date(value);

    return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

  const [year, month, day] = parts;

  if (mode === "end") {
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function isPedidoWithinDateRange(pedido, query) {
  const closedAt = getPedidoSortDate(pedido);

  if (!closedAt) return false;

  const pedidoDate = new Date(closedAt);

  if (Number.isNaN(pedidoDate.getTime())) return false;

  const fromDate = getDateBoundary(query.from, "start");
  const toDate = getDateBoundary(query.to, "end");

  if (fromDate && pedidoDate < fromDate) return false;
  if (toDate && pedidoDate > toDate) return false;

  return true;
}

function getPedidoSearchText(pedido) {
  const itens = Array.isArray(pedido?.itens) ? pedido.itens : [];

  const itemText = itens
    .map((item) => {
      const receita = item?.receitaLinha?.receita;

      return [
        item?.medicamento,
        item?.tipo,
        item?.status,
        item?.utente?.nome,
        item?.utente?.numero9,
        receita?.numero19,
        receita?.pinAcesso6,
        receita?.pinOpcao4,
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join(" ");

  return [
    pedido?.numero ? `#${pedido.numero}` : "",
    pedido?.numero,
    pedido?.status,
    pedido?.closedReason,
    itemText,
  ]
    .filter(Boolean)
    .join(" ");
}

function matchesPedidoSearch(pedido, query) {
  const search = normalizeSearchValue(query.search);

  if (!search) return true;

  return normalizeSearchValue(getPedidoSearchText(pedido)).includes(search);
}

function filterHistoricoPedidos(pedidos = [], query) {
  return pedidos.filter((pedido) => {
    return (
      matchesPedidoSearch(pedido, query) &&
      isPedidoWithinDateRange(pedido, query)
    );
  });
}

function buildHistoricoResponse(pedidos = [], query) {
  const filteredPedidos = filterHistoricoPedidos(pedidos, query);
  const sortedPedidos = sortHistoricoPedidos(filteredPedidos);

  return {
    data: sortedPedidos.slice(query.skip, query.skip + query.take),
    meta: {
      total: filteredPedidos.length,
      skip: query.skip,
      take: query.take,
    },
  };
}

export async function getFarmaciaHistorico(query = {}) {
  const finalQuery = normalizeHistoricoQuery({
    ...DEFAULT_HISTORICO_QUERY,
    ...query,
  });

  if (finalQuery.status && finalQuery.status !== "TODOS") {
    const response = await httpClient.get(API_ENDPOINTS.farmacia.pedidos, {
      query: {
        status: finalQuery.status,
        skip: 0,
        take: HISTORICO_FETCH_TAKE,
      },
    });

    return buildHistoricoResponse(
      Array.isArray(response?.data) ? response.data : [],
      finalQuery,
    );
  }

  const responses = await Promise.all(
    HISTORICO_STATUS.map((status) =>
      httpClient.get(API_ENDPOINTS.farmacia.pedidos, {
        query: {
          status,
          skip: 0,
          take: HISTORICO_FETCH_TAKE,
        },
      }),
    ),
  );

  const pedidos = responses.flatMap((response) =>
    Array.isArray(response?.data) ? response.data : [],
  );

  return buildHistoricoResponse(pedidos, finalQuery);
}
