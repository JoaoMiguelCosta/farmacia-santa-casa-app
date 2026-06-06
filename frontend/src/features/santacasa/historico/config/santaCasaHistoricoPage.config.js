// src/features/santacasa/historico/config/santaCasaHistoricoPage.config.js

export const SANTACASA_HISTORICO_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Histórico",
    description:
      "Consulta o resultado dos pedidos enviados à Farmácia, incluindo validações, rejeições e cancelamentos.",
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

  details: {
    itemCountSingular: "medicamento neste pedido.",
    itemCountPlural: "medicamentos neste pedido.",
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

    itemSearchPlaceholder:
      "Pesquisar por utente, medicamento, receita, PIN ou estado...",

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

    viewDetails: "Ver detalhes",
    hideDetails: "Ocultar detalhes",

    showMoreItems: "Ver mais",
    showAllItems: "Ver todos",
    hideAllItems: "Ocultar lista inteira",
    showInitialItems: "Mostrar",

    hideItems: "Ocultar medicamentos",
  },

  status: {
    VALIDADO: "Validado",
    VALIDADO_COM_AVISOS: "Validado com avisos",
    REJEITADO: "Rejeitado",
    CANCELADO: "Cancelado",
  },

  itemStatus: {
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    REJEITADO: "Rejeitado",
    CANCELADO: "Cancelado",
    CANCELADO_POR_EXPIRACAO: "Cancelado por expiração",
  },

  itemTypes: {
    COM_RECEITA: "Com receita",
    SEM_RECEITA: "Medicamentos não sujeitos a receita médica",
    EXTRA: "Venda Suspensa",
  },

  labels: {
    pedido: "Pedido",
    pedidoNumber: "N.º pedido",
    status: "Estado",

    createdAt: "Criado em",
    validatedAt: "Validado em",
    rejectedAt: "Rejeitado em",
    canceledAt: "Cancelado em",
    closedAt: "Fechado em",

    validatedBy: "Validado por",
    rejectedBy: "Rejeitado por",
    canceledBy: "Cancelado por",

    closedReason: "Motivo",
    rejectionReason: "Motivo da rejeição",
    cancellationReason: "Motivo do cancelamento",

    utente: "Utente",
    utentes: "Utentes",
    unidentifiedUtente: "Utente não identificado",
    utenteNumber: "N.º utente",

    medicamento: "Medicamento",
    medicamentoSingular: "medicamento",
    medicamentoPlural: "medicamentos",

    quantidade: "Quantidade",
    unidadeSingular: "unidade",
    unidadePlural: "unidades",

    warningSingular: "aviso",
    warningPlural: "avisos",

    tipo: "Tipo",

    receita: "Receita",
    receitaNumber: "N.º receita",
    pinAcesso: "PIN de acesso",
    pinOpcao: "PIN de opção",
    validadeReceita: "Validade",
    receitaBarcodesAriaLabel: "Códigos da receita",

    semReceita: "Medicamento não sujeito a receita médica",

    extra: "Venda Suspensa",
    extraRequestedQuantity: "Solicitado",
    extraRegularizedQuantity: "Regularizado",

    items: "Itens do pedido",
    totalItems: "Total de itens",
    totalQuantity: "Quantidade total",

    validatedItems: "Validados",
    expiredCanceledItems: "Cancelados por expiração",
    validatedQuantity: "Quantidade validada",
    notValidatedQuantity: "Quantidade não validada",

    cardStatsTitle: "Resumo operacional",
    cardStatsAriaLabel: "Resumo operacional do pedido",

    statsValidated: "Validados",
    statsRejected: "Rejeitados",
    statsCanceled: "Cancelados",
    statsCanceledByExpiry: "Cancelados por expiração",
    statsValidatedQuantity: "Quantidade validada",
    statsNotValidatedQuantity: "Quantidade não validada",
    statsReleasedQuantity: "Quantidade libertada",

    showingItems: "A mostrar",
    hiddenItems: "Lista de medicamentos ocultada.",
    of: "de",

    itemSearch: "Pesquisa no pedido",
    itemSearchResults: "Resultado da pesquisa",
    itemSearchEmpty: "Nenhum medicamento encontrado neste pedido.",

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

    itemCancelledByExpiry:
      "Este medicamento não foi validado no pedido porque a receita expirou antes da Farmácia concluir a validação.",

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
