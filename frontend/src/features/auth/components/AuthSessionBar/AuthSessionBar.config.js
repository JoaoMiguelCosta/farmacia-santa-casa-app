// src/features/auth/components/AuthSessionBar/AuthSessionBar.config.js
import { AUTH_ROLES } from "../../config/auth.config";

export const AUTH_SESSION_BAR_CONFIG = Object.freeze({
  ariaLabel: "Sessão do utilizador",

  labels: {
    activeSession: "Sessão ativa",
    logout: "Terminar sessão",
    loggingOut: "A terminar...",
    fallbackRole: "Utilizador",
  },

  roleLabels: {
    [AUTH_ROLES.SANTACASA]: "Santa Casa",
    [AUTH_ROLES.FARMACIA]: "Farmácia",
    [AUTH_ROLES.ADMIN]: "Sistema/Admin",
  },
});
