const FARMACIA_BASE_PATH = "farmacia";

export const FARMACIA_ROUTER_PATHS = Object.freeze({
  home: FARMACIA_BASE_PATH,
  dashboard: `${FARMACIA_BASE_PATH}/dashboard`,

  pedidos: `${FARMACIA_BASE_PATH}/pedidos`,
  pedidoDetail: `${FARMACIA_BASE_PATH}/pedidos/:pedidoId`,

  historico: `${FARMACIA_BASE_PATH}/historico`,
  historicoDetail: `${FARMACIA_BASE_PATH}/historico/:pedidoId`,

  regularizacoes: `${FARMACIA_BASE_PATH}/regularizacoes`,
  regularizacoesUtente: `${FARMACIA_BASE_PATH}/regularizacoes/utente/:utenteId`,
  regularizacoesHistoricoUtente: `${FARMACIA_BASE_PATH}/regularizacoes/utente/:utenteId/historico`,
});

const routeEntries = Object.fromEntries(
  Object.entries(FARMACIA_ROUTER_PATHS).map(([key, path]) => [key, `/${path}`]),
);

export const FARMACIA_ROUTES = Object.freeze({
  ...routeEntries,
  regularizacoesHistorico: "/farmacia/regularizacoes?view=history",
});

function getSafeRouteId(value) {
  return String(value || "").trim();
}

export function getFarmaciaPedidoDetailRoute(pedidoId) {
  const normalizedId = getSafeRouteId(pedidoId);

  if (!normalizedId) return FARMACIA_ROUTES.pedidos;

  return `${FARMACIA_ROUTES.pedidos}/${encodeURIComponent(normalizedId)}`;
}

export function getFarmaciaHistoricoDetailRoute(pedidoId) {
  const normalizedId = getSafeRouteId(pedidoId);

  if (!normalizedId) return FARMACIA_ROUTES.historico;

  return `${FARMACIA_ROUTES.historico}/${encodeURIComponent(normalizedId)}`;
}
