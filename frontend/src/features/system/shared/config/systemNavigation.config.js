// src/features/system/shared/config/systemNavigation.config.js

export const SYSTEM_NAV_ITEMS = Object.freeze([
  {
    label: "Visão geral",
    to: "/sistema",
    end: true,
  },
  {
    label: "Utilizadores",
    to: "/sistema/utilizadores",
  },
  {
    label: "Manutenção",
    to: "/sistema/manutencao",
  },
  {
    label: "Estado dos serviços",
    to: "/sistema/estado-servicos",
  },
]);
