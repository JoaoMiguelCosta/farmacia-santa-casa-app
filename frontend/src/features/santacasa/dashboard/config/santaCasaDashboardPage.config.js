export const SANTACASA_DASHBOARD_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Dashboard",
    description:
      "Visão rápida da operação da Santa Casa: utentes, receitas, Extras, pedidos e regularizações.",
  },

  sections: {
    signals: {
      title: "Sinais operacionais",
      description:
        "Resumo dos principais indicadores para acompanhamento diário da Santa Casa.",
      loadingTitle: "A carregar dashboard...",
      errorTitle: "Não foi possível carregar o dashboard.",
    },

    quickLinks: {
      title: "Acessos rápidos",
      description:
        "Atalhos para as principais áreas operacionais da Santa Casa.",
    },
  },

  labels: {
    totalUtentes: "Utentes registados",

    totalReceitas: "Receitas registadas",
    receitasAtivas: "Linhas de receita ativas",
    receitasExpiradas: "Linhas de receita expiradas",

    totalSemReceita: "Medicamentos sem receita",

    extrasPendentes: "Extras pendentes",
    extrasParcialmenteRegularizados: "Extras parcialmente regularizados",
    extrasRegularizados: "Extras regularizados",
    extrasExpirados: "Extras expirados",

    pedidosPendentes: "Pedidos pendentes",
    pedidosValidados: "Pedidos validados",
    pedidosRejeitados: "Pedidos rejeitados",

    regularizacoesPendentes: "Regularizações pendentes",
    regularizacoesParciais: "Regularizações parciais",
    regularizacoesConcluidas: "Regularizações concluídas",

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
    utentes: {
      title: "Utentes",
      description: "Criar, consultar e gerir utentes ativos.",
      to: "/santacasa/utentes",
      actionLabel: "Ver utentes",
    },

    operacao: {
      title: "Operação",
      description:
        "Gerir receitas, medicamentos sem receita, Extras e preparação de pedidos.",
      to: "/santacasa/operacao",
      actionLabel: "Abrir operação",
    },

    pedidos: {
      title: "Pedidos",
      description: "Criar e acompanhar pedidos enviados à Farmácia.",
      to: "/santacasa/pedidos",
      actionLabel: "Ver pedidos",
    },

    regularizacoes: {
      title: "Regularizações",
      description:
        "Acompanhar Extras que aguardam receita futura ou já foram regularizados.",
      to: "/santacasa/regularizacoes",
      actionLabel: "Ver regularizações",
    },

    historico: {
      title: "Histórico",
      description: "Consultar pedidos validados ou rejeitados pela Farmácia.",
      to: "/santacasa/historico",
      actionLabel: "Ver histórico",
    },
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
  },
});
