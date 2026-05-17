export const API_ENDPOINTS = Object.freeze({
  health: "/health",

  santacasa: {
    health: "/santacasa/health",

    dashboard: "/santacasa/dashboard/sinais",

    utentes: "/santacasa/utentes",
    utenteById: (utenteId) => `/santacasa/utentes/${utenteId}`,

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

    manutencaoJobs: "/farmacia/manutencao/jobs",
  },
});
