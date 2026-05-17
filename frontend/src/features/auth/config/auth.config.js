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

export const AUTH_MESSAGES = Object.freeze({
  loadingSession: "A verificar sessão...",
  loginRequired: "Tens de iniciar sessão para continuar.",
  forbidden: "Não tens permissão para aceder a esta área.",
  loginError: "Não foi possível iniciar sessão.",
  logoutError: "Não foi possível terminar sessão.",
  sessionExpired: "Sessão expirada. Inicia sessão novamente.",
});
