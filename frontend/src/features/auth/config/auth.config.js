export const AUTH_ROLES = Object.freeze({
  SANTACASA: "SANTACASA",
  FARMACIA: "FARMACIA",
  ADMIN: "ADMIN",
});

export const AUTH_REDIRECTS = Object.freeze({
  login: "/login",

  byRole: {
    [AUTH_ROLES.SANTACASA]: "/santacasa",
    [AUTH_ROLES.FARMACIA]: "/farmacia",
    [AUTH_ROLES.ADMIN]: "/sistema",
  },
});

export const AUTH_SESSION_CONFIG = Object.freeze({
  idleTimeoutMs: 1000 * 60 * 30,
  warningBeforeMs: 1000 * 60,
  lastActivityStorageKey: "farmacia-santacasa:last-activity-at",
  activityEvents: [
    "click",
    "keydown",
    "mousemove",
    "scroll",
    "touchstart",
    "visibilitychange",
  ],
});

export const AUTH_MESSAGES = Object.freeze({
  loadingSession: "A verificar sessão...",
  sessionCheckError: "Não foi possível verificar a sessão.",

  loginRequired: "Tens de iniciar sessão para continuar.",
  forbidden: "Não tens permissão para aceder a esta área.",

  loginError: "Não foi possível iniciar sessão.",
  logoutError: "Não foi possível terminar sessão.",

  sessionExpired: "Sessão expirada. Inicia sessão novamente.",
  sessionExpiredByInactivity:
    "Sessão terminada por inatividade. Inicia sessão novamente.",
  sessionExpiringSoon:
    "A tua sessão vai terminar por inatividade dentro de instantes.",
});
