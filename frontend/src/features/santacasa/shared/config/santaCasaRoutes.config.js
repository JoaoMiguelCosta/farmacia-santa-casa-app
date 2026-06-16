// src/features/santacasa/shared/config/santaCasaRoutes.config.js

const SANTACASA_BASE_PATH = "santacasa";

export const SANTACASA_ROUTER_PATHS = Object.freeze({
  home: SANTACASA_BASE_PATH,
  dashboard: `${SANTACASA_BASE_PATH}/dashboard`,
  utentes: `${SANTACASA_BASE_PATH}/utentes`,
  operacao: `${SANTACASA_BASE_PATH}/operacao`,

  pedidos: `${SANTACASA_BASE_PATH}/pedidos`,
  pedidoDetail: `${SANTACASA_BASE_PATH}/pedidos/:pedidoId`,

  regularizacoes: `${SANTACASA_BASE_PATH}/regularizacoes`,
  regularizacoesUtente: `${SANTACASA_BASE_PATH}/regularizacoes/utente/:utenteId`,
  regularizacoesHistoricoUtente: `${SANTACASA_BASE_PATH}/regularizacoes/utente/:utenteId/historico`,

  historico: `${SANTACASA_BASE_PATH}/historico`,
  historicoDetail: `${SANTACASA_BASE_PATH}/historico/:pedidoId`,

  legacyReceitas: `${SANTACASA_BASE_PATH}/receitas`,
  legacySemReceita: `${SANTACASA_BASE_PATH}/sem-receita`,
  legacyExtras: `${SANTACASA_BASE_PATH}/extras`,
});

export const SANTACASA_ROUTES = Object.freeze(
  Object.fromEntries(
    Object.entries(SANTACASA_ROUTER_PATHS).map(([key, path]) => [
      key,
      `/${path}`,
    ]),
  ),
);

function getSafeRouteId(value) {
  return String(value || "").trim();
}

export function getSantaCasaPedidoDetailRoute(pedidoId) {
  const normalizedPedidoId = getSafeRouteId(pedidoId);

  if (!normalizedPedidoId) {
    return SANTACASA_ROUTES.pedidos;
  }

  return `${SANTACASA_ROUTES.pedidos}/${encodeURIComponent(
    normalizedPedidoId,
  )}`;
}

export function getSantaCasaHistoricoDetailRoute(pedidoId) {
  const normalizedPedidoId = getSafeRouteId(pedidoId);

  if (!normalizedPedidoId) {
    return SANTACASA_ROUTES.historico;
  }

  return `${SANTACASA_ROUTES.historico}/${encodeURIComponent(
    normalizedPedidoId,
  )}`;
}
