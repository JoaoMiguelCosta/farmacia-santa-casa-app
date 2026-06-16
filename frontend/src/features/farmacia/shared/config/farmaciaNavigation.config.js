import { FARMACIA_ROUTES } from "./farmaciaRoutes.config";

export const FARMACIA_NAV_ITEMS = Object.freeze([
  Object.freeze({
    label: "Visão geral",
    to: FARMACIA_ROUTES.home,
    end: true,
  }),

  Object.freeze({
    label: "Pedidos",
    to: FARMACIA_ROUTES.pedidos,
  }),

  Object.freeze({
    label: "Regularizações",
    to: FARMACIA_ROUTES.regularizacoes,
  }),

  Object.freeze({
    label: "Histórico",
    to: FARMACIA_ROUTES.historico,
  }),

  Object.freeze({
    label: "Dashboard",
    to: FARMACIA_ROUTES.dashboard,
    placement: "end",
  }),
]);
