export const FARMACIA_DASHBOARD_PAGE = Object.freeze({
  header: Object.freeze({
    eyebrow: "Farmácia",
    title: "Dashboard",
    description:
      "Consulta prioridades, indicadores e o estado atual da operação da Farmácia.",
  }),

  sections: Object.freeze({
    priorities: Object.freeze({
      title: "Prioridades operacionais",
      description:
        "Situações que podem exigir decisão ou acompanhamento da Farmácia.",
      ariaLabel: "Prioridades operacionais da Farmácia",
    }),

    indicators: Object.freeze({
      eyebrow: "Indicadores",
      title: "Indicadores por área",
      description:
        "Consulta os principais totais e estados da atividade da Farmácia.",
    }),

    groups: Object.freeze({
      pedidos: Object.freeze({
        title: "Pedidos",
        description:
          "Estado atual dos pedidos recebidos, validados ou rejeitados.",
        tone: "blue",
      }),

      regularizacoes: Object.freeze({
        title: "Regularizações",
        description:
          "Resumo das Vendas Suspensas pendentes e já regularizadas.",
        tone: "sage",
      }),
    }),

    signals: Object.freeze({
      loadingTitle: "A carregar dashboard...",
      loadingDescription:
        "Aguarda enquanto os indicadores operacionais são carregados.",
      errorTitle: "Não foi possível carregar o dashboard.",
    }),
  }),

  labels: Object.freeze({
    pendingPedidos: "Pedidos pendentes",
    validatedPedidos: "Pedidos validados",
    rejectedPedidos: "Pedidos rejeitados",

    pendingRegularizacoes: "Regularizações pendentes",
    regularizacoesConcluidas: "Regularizações concluídas",
    regularizacoesEventos: "Eventos de regularização",
    regularizacoesUnidades: "Unidades regularizadas",
    latestRegularizacao: "Última regularização",

    latestPedido: "Último pedido",
    status: "Estado",
    pedidoNumber: "N.º pedido",
    createdAt: "Criado em",
    validatedAt: "Validado em",
    rejectedAt: "Rejeitado em",
    updatedAt: "Atualizado em",
  }),

  priorityStates: Object.freeze({
    pedidosClear: "Sem pedidos pendentes",
    pedidosAttention: "Aguardam validação ou rejeição",

    regularizacoesClear: "Sem regularizações pendentes",
    regularizacoesAttention: "Requer acompanhamento",
  }),

  latestPedido: Object.freeze({
    emptyTitle: "Sem pedidos registados",
    emptyDescription:
      "Quando existir atividade, o último pedido recebido aparece aqui.",
  }),

  status: Object.freeze({
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    REJEITADO: "Rejeitado",
  }),

  statusTones: Object.freeze({
    PENDENTE: "warning",
    VALIDADO: "success",
    REJEITADO: "danger",
  }),

  actions: Object.freeze({
    refresh: "Atualizar",
    refreshing: "A atualizar...",
  }),

  cards: Object.freeze({
    pedidosPendentes: Object.freeze({
      to: "/farmacia/pedidos",
      actionLabel: "Ver pedidos",
    }),

    historico: Object.freeze({
      to: "/farmacia/historico",
    }),

    regularizacoes: Object.freeze({
      to: "/farmacia/regularizacoes",
      actionLabel: "Ver regularizações",
    }),
  }),

  feedback: Object.freeze({
    genericError: "Ocorreu um erro inesperado.",
  }),
});
