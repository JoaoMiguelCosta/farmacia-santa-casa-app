const SYSTEM_MANUTENCAO_ENDPOINTS = Object.freeze({
  jobs: "/manutencao/jobs",

  receitaExpiryPreview: "/manutencao/jobs/receita-expiry/preview",
  receitaExpiryRun: "/manutencao/jobs/receita-expiry/run",

  higienePreview: "/manutencao/jobs/higiene/preview",
  higieneRun: "/manutencao/jobs/higiene/run",

  purgeHistoryPreview: "/manutencao/jobs/purge-history/preview",
  purgeHistoryRun: "/manutencao/jobs/purge-history/run",
});

export const API_ENDPOINTS = Object.freeze({
  health: "/health",

  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },

  admin: {
    users: "/admin/users",
    userById: (userId) => `/admin/users/${userId}`,
    userPassword: (userId) => `/admin/users/${userId}/password`,
    userStatus: (userId) => `/admin/users/${userId}/status`,
  },

  santacasa: {
    health: "/santacasa/health",

    dashboard: "/santacasa/dashboard/sinais",

    utentes: "/santacasa/utentes",
    utenteById: (utenteId) => `/santacasa/utentes/${utenteId}`,
    archiveUtente: (utenteId) => `/santacasa/utentes/${utenteId}/archive`,
    reactivateUtente: (utenteId) => `/santacasa/utentes/${utenteId}/reactivate`,

    semReceita: (utenteId) => `/santacasa/utentes/${utenteId}/sem-receita`,
    semReceitaById: (utenteId, semReceitaId) =>
      `/santacasa/utentes/${utenteId}/sem-receita/${semReceitaId}`,

    receitas: (utenteId) => `/santacasa/utentes/${utenteId}/receitas`,
    receitaLinhaById: (utenteId, linhaId) =>
      `/santacasa/utentes/${utenteId}/receitas/linhas/${linhaId}`,

    extras: (utenteId) => `/santacasa/utentes/${utenteId}/extras`,
    extraById: (utenteId, extraId) =>
      `/santacasa/utentes/${utenteId}/extras/${extraId}`,

    pedidos: "/santacasa/pedidos",
    pedidoById: (pedidoId) => `/santacasa/pedidos/${pedidoId}`,
    pedidosHistorico: "/santacasa/pedidos/historico",

    regularizacoesPendentes: "/santacasa/regularizacoes/pendentes",
    regularizacoesHistorico: "/santacasa/regularizacoes/historico",
    regularizacoesSinal: "/santacasa/regularizacoes/sinal",
  },

  farmacia: {
    health: "/farmacia/health",

    dashboard: "/farmacia/dashboard/sinais",

    pedidos: "/farmacia/pedidos",
    validarPedido: (pedidoId) => `/farmacia/pedidos/${pedidoId}/validar`,
    rejeitarPedido: (pedidoId) => `/farmacia/pedidos/${pedidoId}/rejeitar`,

    regularizacoesPendentes: "/farmacia/regularizacoes/pendentes",
    regularizacoesHistorico: "/farmacia/regularizacoes/historico",
    regularizacoesSinal: "/farmacia/regularizacoes/sinal",
  },

  system: {
    manutencao: SYSTEM_MANUTENCAO_ENDPOINTS,
  },

  manutencao: SYSTEM_MANUTENCAO_ENDPOINTS,
});
