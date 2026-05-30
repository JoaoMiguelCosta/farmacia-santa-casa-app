// src/features/farmacia/shared/config/farmaciaNavigation.config.js
export const FARMACIA_NAV_ITEMS = Object.freeze([
  {
    label: "Visão geral",
    to: "/farmacia",
    end: true,
  },
  {
    label: "Dashboard",
    to: "/farmacia/dashboard",
  },
  {
    label: "Pedidos",
    to: "/farmacia/pedidos",
  },
  {
    label: "Regularizações",
    to: "/farmacia/regularizacoes",
  },
  {
    label: "Histórico",
    to: "/farmacia/historico",
  },
]);
