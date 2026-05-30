// src/shared/layouts/AppShell/AppShell.config.js
import { AUTH_ROLES } from "../../../features/auth/config/auth.config";

export const APP_SHELL_CONFIG = Object.freeze({
  mainContentId: "main-content",

  labels: {
    skipToContent: "Saltar para o conteúdo",
    brandHome: "Ir para o início",
    mainNavigation: "Navegação principal",
  },

  sectionNavLabels: {
    santacasa: "Navegação interna da Santa Casa",
    farmacia: "Navegação interna da Farmácia",
  },
});

export const APP_NAV_ITEMS = Object.freeze([
  {
    label: "Início",
    to: "/",
    end: true,
    authOnly: true,
  },
  {
    label: "Santa Casa",
    to: "/santacasa",
    allowedRoles: [AUTH_ROLES.SANTACASA, AUTH_ROLES.ADMIN],
  },
  {
    label: "Farmácia",
    to: "/farmacia",
    allowedRoles: [AUTH_ROLES.FARMACIA, AUTH_ROLES.ADMIN],
  },
  {
    label: "Sistema",
    to: "/sistema",
    allowedRoles: [AUTH_ROLES.ADMIN],
  },
]);
