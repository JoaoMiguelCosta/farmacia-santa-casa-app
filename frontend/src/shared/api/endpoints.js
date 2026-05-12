export const API_ENDPOINTS = Object.freeze({
  health: "/health",

  santacasa: {
    health: "/santacasa/health",
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
  },

  farmacia: {
    health: "/farmacia/health",
    pedidos: "/farmacia/pedidos",
    validarPedido: (pedidoId) => `/farmacia/pedidos/${pedidoId}/validar`,
    rejeitarPedido: (pedidoId) => `/farmacia/pedidos/${pedidoId}/rejeitar`,
    dashboard: "/farmacia/dashboard/sinais",
    regularizacoesPendentes: "/farmacia/regularizacoes/pendentes",
    regularizacoesHistorico: "/farmacia/regularizacoes/historico",
    regularizacoesSinal: "/farmacia/regularizacoes/sinal",
    manutencaoJobs: "/farmacia/manutencao/jobs",
  },
});
