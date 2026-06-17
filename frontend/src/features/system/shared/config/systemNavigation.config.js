import { SYSTEM_ROUTES } from "./systemRoutes.config";

export const SYSTEM_NAV_ITEMS = Object.freeze([
  Object.freeze({
    label: "Visão geral",
    to: SYSTEM_ROUTES.home,
    end: true,
  }),

  Object.freeze({
    label: "Utilizadores",
    to: SYSTEM_ROUTES.utilizadores,
  }),

  Object.freeze({
    label: "Manutenção",
    to: SYSTEM_ROUTES.manutencao,
  }),

  Object.freeze({
    label: "Estado dos serviços",
    to: SYSTEM_ROUTES.estadoServicos,
  }),
]);
