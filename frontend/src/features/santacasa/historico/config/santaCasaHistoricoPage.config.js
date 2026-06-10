// src/features/santacasa/historico/config/santaCasaHistoricoPage.config.js

export const SANTACASA_HISTORICO_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Histórico",

    description:
      "Consulta o resultado dos pedidos enviados à Farmácia, incluindo validações, rejeições e cancelamentos.",
  },

  detail: {
    backLabel: "Voltar ao histórico",

    eyebrow: "Santa Casa",
    title: "Detalhe do histórico",

    description:
      "Consulta a decisão final, a auditoria e os medicamentos incluídos neste pedido.",

    refreshLabel: "Atualizar pedido",
    refreshingLabel: "A atualizar...",

    loadingTitle: "A carregar pedido...",

    loadingDescription: "Aguarda enquanto os dados do pedido são carregados.",

    errorTitle: "Não foi possível carregar o pedido do histórico.",

    retryLabel: "Tentar novamente",

    summaryTitle: "Resumo da decisão",

    summaryDescription: "Informação final e registo de auditoria deste pedido.",

    summary: {
      ariaLabel: "Resumo da decisão do pedido",

      labels: {
        pedido: "Pedido",
        status: "Estado",
        utentes: "Utentes",
        totalItems: "Medicamentos",

        totalQuantity: "Quantidade total",
      },
    },

    operational: {
      title: "Resumo operacional",

      ariaLabel: "Resumo operacional do pedido",

      labels: {
        totalItems: "Medicamentos",

        totalQuantity: "Quantidade total",

        validatedItems: "Validados",

        validatedQuantity: "Quantidade validada",

        rejectedItems: "Rejeitados",

        rejectedQuantity: "Quantidade rejeitada",

        canceledItems: "Cancelados",

        expiredItems: "Cancelados por expiração",

        expiredQuantity: "Quantidade não validada",

        releasedQuantity: "Quantidade libertada",
      },
    },

    itemsTitle: "Medicamentos por utente",

    itemsDescription:
      "Medicamentos do pedido organizados pelos respetivos utentes, incluindo receitas, validade e quantidades.",
  },

  sections: {
    list: {
      title: "Histórico de pedidos",

      description:
        "Pedidos fechados, organizados por data de decisão ou cancelamento.",

      emptyTitle: "Sem pedidos no histórico.",

      emptyDescription:
        "Quando existirem pedidos validados, rejeitados ou cancelados, aparecem aqui.",

      loadingTitle: "A carregar histórico...",

      loadingDescription: "Aguarda enquanto os dados são carregados.",

      errorTitle: "Não foi possível carregar o histórico.",
    },
  },

  filters: {
    ariaLabel: "Filtros do histórico",

    totalLabel: "Total Pedidos",

    statusLabel: "Estado",
    searchLabel: "Pesquisa",

    searchPlaceholder:
      "Pesquisar por Pedido, Utente, Medicamento ou Receita...",

    fromLabel: "Data inicial",
    toLabel: "Data final",

    submit: "Filtrar",
    clear: "Limpar",

    statusOptions: [
      {
        value: "TODOS",
        label: "Todos",
      },
      {
        value: "VALIDADO",
        label: "Validados",
      },
      {
        value: "REJEITADO",
        label: "Rejeitados",
      },
      {
        value: "CANCELADO",
        label: "Cancelados",
      },
    ],
  },

  pagination: {
    ariaLabel: "Paginação do histórico da Santa Casa",

    emptyLabel: "Sem resultados.",

    showingLabel: "A mostrar",
    pageLabel: "Página",
    ofLabel: "de",

    pedidoSingular: "pedido",
    pedidoPlural: "pedidos",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",

    previous: "Anterior",
    next: "Seguinte",

    viewPedido: "Consultar pedido",
  },

  status: {
    VALIDADO: "Validado",

    VALIDADO_COM_AVISOS: "Validado com avisos",

    REJEITADO: "Rejeitado",
    CANCELADO: "Cancelado",
  },

  labels: {
    pedido: "Pedido",
    status: "Estado",

    validatedAt: "Validado em",
    rejectedAt: "Rejeitado em",
    canceledAt: "Cancelado em",
    closedAt: "Fechado em",

    validatedBy: "Validado por",
    rejectedBy: "Rejeitado por",
    canceledBy: "Cancelado por",
    closedBy: "Decidido por",

    closedReason: "Motivo",

    rejectionReason: "Motivo da rejeição",

    cancellationReason: "Motivo do cancelamento",

    utentes: "Utentes",

    totalItems: "Total de itens",

    totalQuantity: "Quantidade total",

    warningSingular: "aviso",
    warningPlural: "avisos",

    statsValidated: "Validados",
    statsRejected: "Rejeitados",
    statsCanceled: "Cancelados",

    statsCanceledByExpiry: "Cancelados por expiração",

    automaticCancellationNoticeTitle: "Cancelamento automático",

    manualCancellationNoticeTitle: "Cancelamento pela Santa Casa",

    validatedWithWarningsNoticeTitle: "Pedido validado com avisos",

    systemAutomatic: "Sistema automático",

    emptyValue: "—",
  },

  messages: {
    validated:
      "Este pedido foi validado pela Farmácia e os respetivos efeitos foram aplicados.",

    validatedWithWarnings:
      "Este pedido foi validado pela Farmácia, mas alguns medicamentos não foram incluídos porque a validade da receita terminou antes da validação.",

    validatedWithWarningsNotice:
      "Confirma os detalhes do pedido. Os medicamentos assinalados como cancelados por expiração não foram dispensados nem incluídos na validação.",

    rejected:
      "Este pedido foi rejeitado pela Farmácia. Os itens deixaram de estar reservados.",

    cancelledByExpiry:
      "Este pedido foi cancelado automaticamente porque uma receita associada expirou antes da validação pela Farmácia.",

    cancelledManually:
      "Este pedido foi cancelado pela Santa Casa antes da validação pela Farmácia.",

    cancelledByExpiryRelease:
      "Os medicamentos ainda pendentes deixaram de estar reservados e voltaram às respetivas listas disponíveis, desde que continuem válidos. A receita expirada não volta à lista de receitas disponíveis.",

    cancelledManuallyRelease:
      "Os itens deixaram de estar reservados e voltaram às respetivas listas disponíveis, desde que continuem válidos.",

    noReason: "Sem motivo registado.",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
  },
});
