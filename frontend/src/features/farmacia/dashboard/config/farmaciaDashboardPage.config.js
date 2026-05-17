export const FARMACIA_DASHBOARD_PAGE = Object.freeze({
  header: {
    eyebrow: "Farmácia",
    title: "Dashboard",
    description:
      "Visão rápida dos sinais operacionais da Farmácia: pedidos, validações, rejeições e regularizações.",
  },

  sections: {
    signals: {
      title: "Sinais operacionais",
      description:
        "Resumo dos principais indicadores para acompanhamento diário.",
      loadingTitle: "A carregar dashboard...",
      errorTitle: "Não foi possível carregar o dashboard.",
    },

    quickLinks: {
      title: "Acessos rápidos",
      description: "Atalhos para as principais áreas operacionais da Farmácia.",
    },
  },

  labels: {
    pendingPedidos: "Pedidos pendentes",
    validatedPedidos: "Pedidos validados",
    rejectedPedidos: "Pedidos rejeitados",
    pendingRegularizacoes: "Regularizações pendentes",
    latestPedido: "Último pedido",
    status: "Estado",
    pedidoNumber: "N.º pedido",
    createdAt: "Criado em",
    validatedAt: "Validado em",
    rejectedAt: "Rejeitado em",
    updatedAt: "Atualizado em",
  },

  status: {
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    REJEITADO: "Rejeitado",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
    open: "Abrir",
  },

  cards: {
    pedidosPendentes: {
      title: "Pedidos pendentes",
      description:
        "Pedidos enviados pela Santa Casa que ainda aguardam validação ou rejeição.",
      to: "/farmacia/pedidos",
      actionLabel: "Ver pedidos",
    },

    historico: {
      title: "Histórico",
      description: "Pedidos já validados ou rejeitados pela Farmácia.",
      to: "/farmacia/historico",
      actionLabel: "Ver histórico",
    },

    regularizacoes: {
      title: "Regularizações",
      description:
        "Extras que aguardam regularização ou já foram compensados por receitas futuras.",
      to: "/farmacia/regularizacoes",
      actionLabel: "Ver regularizações",
    },

  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
  },
});
