// src/shared/layouts/AppShell/AppShell.config.js

import { AUTH_ROLES } from "../../../features/auth/config/auth.config";

export const APP_SHELL_CONFIG = Object.freeze({
  mainContentId: "main-content",

  labels: Object.freeze({
    skipToContent: "Saltar para o conteúdo",
    brandHome: "Ir para o início",
    mainNavigation: "Navegação principal",
  }),

  sectionNavLabels: Object.freeze({
    santacasa: "Navegação interna da Santa Casa",
    farmacia: "Navegação interna da Farmácia",
    system: "Navegação interna do Sistema",
  }),
});

export const APP_AREA_NAV_ITEMS = Object.freeze({
  [AUTH_ROLES.SANTACASA]: Object.freeze({
    label: "Santa Casa",
    to: "/santacasa",
  }),

  [AUTH_ROLES.FARMACIA]: Object.freeze({
    label: "Farmácia",
    to: "/farmacia",
  }),
});

export const APP_NAV_ITEMS = Object.freeze([
  Object.freeze({
    label: "Santa Casa",
    to: "/santacasa",
    allowedRoles: [AUTH_ROLES.ADMIN],
  }),

  Object.freeze({
    label: "Farmácia",
    to: "/farmacia",
    allowedRoles: [AUTH_ROLES.ADMIN],
  }),

  Object.freeze({
    label: "Sistema",
    to: "/sistema",
    allowedRoles: [AUTH_ROLES.ADMIN],
  }),
]);
