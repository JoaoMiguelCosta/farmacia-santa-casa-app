// src/features/auth/components/AuthGuardState/AuthGuardState.config.js

import { AUTH_MESSAGES } from "../../config/auth.config";

export const AUTH_GUARD_STATE_CONFIG = Object.freeze({
  homeRedirect: Object.freeze({
    title: AUTH_MESSAGES.loadingSession,
    description: "A aguardar confirmação da sessão.",
  }),

  authentication: Object.freeze({
    title: AUTH_MESSAGES.loadingSession,
    description: "Aguarda enquanto confirmamos se tens sessão ativa.",
  }),

  permissions: Object.freeze({
    title: AUTH_MESSAGES.loadingSession,
    description: "Aguarda enquanto confirmamos as permissões da tua conta.",
  }),
});
