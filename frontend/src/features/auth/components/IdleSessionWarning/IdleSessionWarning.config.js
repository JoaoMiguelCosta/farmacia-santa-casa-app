// src/features/auth/components/IdleSessionWarning/IdleSessionWarning.config.js

import { AUTH_MESSAGES } from "../../config/auth.config";

export const IDLE_SESSION_WARNING_CONFIG = Object.freeze({
  title: "Sessão quase a terminar",

  description: Object.freeze({
    message: AUTH_MESSAGES.sessionExpiringSoon,
    remainingTimePrefix: "Tens cerca de",
    remainingTimeSuffix: "para continuar.",
  }),

  actions: Object.freeze({
    continueSession: "Continuar sessão",
  }),
});
