import { SANTACASA_ROUTES } from "./santaCasaRoutes.config";

export const SANTACASA_NAV_ITEMS = Object.freeze([
  Object.freeze({
    label: "Visão geral",
    to: SANTACASA_ROUTES.home,
    end: true,
  }),

  Object.freeze({
    label: "Dashboard",
    to: SANTACASA_ROUTES.dashboard,
  }),

  Object.freeze({
    label: "Utentes",
    to: SANTACASA_ROUTES.utentes,
  }),

  Object.freeze({
    label: "Operação",
    to: SANTACASA_ROUTES.operacao,
  }),

  Object.freeze({
    label: "Pedidos",
    to: SANTACASA_ROUTES.pedidos,
  }),

  Object.freeze({
    label: "Regularizações",
    to: SANTACASA_ROUTES.regularizacoes,
  }),

  Object.freeze({
    label: "Histórico",
    to: SANTACASA_ROUTES.historico,
  }),
]);
