// src/features/santacasa/pedidos/utils/santaCasaPedidosQuery.utils.js

export const SANTACASA_PEDIDOS_DEFAULT_QUERY = Object.freeze({
  search: "",
  page: 1,
  take: 10,
});

function getSafeSearchParams(searchParams) {
  if (searchParams instanceof URLSearchParams) {
    return searchParams;
  }

  return new URLSearchParams(searchParams);
}

function normalizeSearch(value) {
  return String(value || "").trim();
}

function normalizePositiveInteger(value, fallback) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(1, Math.floor(numberValue));
}

export function getSantaCasaPedidosQueryFromSearchParams(searchParams) {
  const safeSearchParams = getSafeSearchParams(searchParams);

  const search = normalizeSearch(safeSearchParams.get("search"));

  const page = normalizePositiveInteger(
    safeSearchParams.get("page"),
    SANTACASA_PEDIDOS_DEFAULT_QUERY.page,
  );

  const take = SANTACASA_PEDIDOS_DEFAULT_QUERY.take;
  const skip = (page - 1) * take;

  return {
    search,
    page,
    skip,
    take,
  };
}

export function buildSantaCasaPedidosSearchParams({
  currentSearchParams,
  search = SANTACASA_PEDIDOS_DEFAULT_QUERY.search,
  page = SANTACASA_PEDIDOS_DEFAULT_QUERY.page,
}) {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  const normalizedSearch = normalizeSearch(search);

  const normalizedPage = normalizePositiveInteger(
    page,
    SANTACASA_PEDIDOS_DEFAULT_QUERY.page,
  );

  if (normalizedSearch) {
    nextSearchParams.set("search", normalizedSearch);
  } else {
    nextSearchParams.delete("search");
  }

  if (normalizedPage > SANTACASA_PEDIDOS_DEFAULT_QUERY.page) {
    nextSearchParams.set("page", String(normalizedPage));
  } else {
    nextSearchParams.delete("page");
  }

  return nextSearchParams;
}
