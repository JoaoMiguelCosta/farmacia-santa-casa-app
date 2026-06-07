import { SANTACASA_ROUTES } from "../../shared/config/santaCasaRoutes.config";

export const SANTACASA_DASHBOARD_PAGE = Object.freeze({
  header: Object.freeze({
    eyebrow: "Santa Casa",
    title: "Dashboard",
    description:
      "Consulta prioridades, indicadores e o estado atual da operação da Santa Casa.",
  }),

  sections: Object.freeze({
    priorities: Object.freeze({
      title: "Prioridades operacionais",
      description:
        "Situações que podem exigir acompanhamento ou ação da Santa Casa.",
      ariaLabel: "Prioridades operacionais da Santa Casa",
    }),

    indicators: Object.freeze({
      eyebrow: "Indicadores",
      title: "Indicadores por área",
      description:
        "Consulta os principais totais e estados da atividade da Santa Casa.",
    }),

    groups: Object.freeze({
      utentes: Object.freeze({
        title: "Utentes",
        description: "Resumo dos utentes registados e do respetivo estado.",
        tone: "sage",
      }),

      receitasMedicacao: Object.freeze({
        title: "Receitas e medicamentos",
        description:
          "Resumo das receitas e dos medicamentos registados na operação.",
        tone: "green",
      }),

      pedidos: Object.freeze({
        title: "Pedidos",
        description: "Estado atual dos pedidos enviados à Farmácia.",
        tone: "blue",
      }),

      regularizacoes: Object.freeze({
        title: "Regularizações",
        description: "Estado das regularizações realizadas pela Farmácia.",
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
    totalUtentes: "Total de utentes",
    utentesAtivos: "Utentes ativos",
    utentesArquivados: "Utentes arquivados",

    totalReceitas: "Receitas registadas",
    receitasAtivas: "Medicamentos com receita ativos",

    totalSemReceita: "Medicamentos não sujeitos a receita médica",

    extrasAbertos: "Medicamentos para Venda Suspensa",

    pedidosPendentes: "Pedidos pendentes",
    pedidosValidados: "Pedidos validados",
    pedidosRejeitados: "Pedidos rejeitados",
    pedidosCancelados: "Pedidos cancelados",

    regularizacoesPendentes: "Regularizações pendentes",
    regularizacoesParciais: "Regularizações parciais",
    regularizacoesConcluidas: "Regularizações concluídas",

    latestPedido: "Último pedido",
    status: "Estado",
    pedidoNumber: "N.º pedido",
    createdAt: "Criado em",
    validatedAt: "Validado em",
    rejectedAt: "Rejeitado em",
    canceledAt: "Cancelado em",
    updatedAt: "Atualizado em",
  }),

  priorityStates: Object.freeze({
    pedidosClear: "Sem pedidos pendentes",
    pedidosAttention: "Aguardam decisão da Farmácia",

    regularizacoesClear: "Sem regularizações pendentes",
    regularizacoesAttention: "Requer acompanhamento",
  }),

  latestPedido: Object.freeze({
    emptyTitle: "Sem pedidos registados",
    emptyDescription:
      "Quando existir atividade, o último pedido enviado aparece aqui.",
  }),

  status: Object.freeze({
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    REJEITADO: "Rejeitado",
    CANCELADO: "Cancelado",
  }),

  statusTones: Object.freeze({
    PENDENTE: "warning",
    VALIDADO: "success",
    REJEITADO: "danger",
    CANCELADO: "danger",
  }),

  actions: Object.freeze({
    refresh: "Atualizar",
    refreshing: "A atualizar...",
  }),

  cards: Object.freeze({
    utentes: Object.freeze({
      to: SANTACASA_ROUTES.utentes,
    }),

    operacao: Object.freeze({
      to: SANTACASA_ROUTES.operacao,
    }),

    pedidos: Object.freeze({
      to: SANTACASA_ROUTES.pedidos,
      actionLabel: "Ver pedidos",
    }),

    regularizacoes: Object.freeze({
      to: SANTACASA_ROUTES.regularizacoes,
      actionLabel: "Ver regularizações",
    }),

    historico: Object.freeze({
      to: SANTACASA_ROUTES.historico,
    }),
  }),

  feedback: Object.freeze({
    genericError: "Ocorreu um erro inesperado.",
  }),
});
