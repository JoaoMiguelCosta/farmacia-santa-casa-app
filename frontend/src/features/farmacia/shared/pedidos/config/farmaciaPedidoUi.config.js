// src/features/farmacia/shared/pedidos/config/farmaciaPedidoUi.config.js
export const FARMACIA_PEDIDO_UI = Object.freeze({
  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",

    openPedido: "Abrir pedido",

    validate: "Validar pedido",
    validating: "A validar...",

    reject: "Rejeitar pedido",
    rejecting: "A rejeitar...",

    viewDetails: "Ver detalhes",
    hideDetails: "Ocultar detalhes",

    viewReceita: "Ver receita",
    hideReceita: "Ocultar receita",

    viewMedicamentos: "Ver medicamentos",
    hideMedicamentos: "Ocultar medicamentos",

    previousPage: "Anterior",
    nextPage: "Seguinte",
  },

  status: {
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    REJEITADO: "Rejeitado",
  },

  itemStatus: {
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    REJEITADO: "Rejeitado",
    CANCELADO_POR_EXPIRACAO: "Cancelado por expiração",
  },

  itemTypes: {
    COM_RECEITA: "Com receita",
    SEM_RECEITA: "Medicamento não sujeito a receita médica",
    EXTRA: "Venda Suspensa",
  },

  itemFilters: {
    ALL: "Todos",
    COM_RECEITA: "Com receita",
    EXTRA: "Vendas Suspensas",
    SEM_RECEITA: "Não sujeitos a receita médica",
  },

  utentesList: {
    pageSize: 10,
    searchMinItems: 6,

    searchLabel: "Pesquisar utentes",
    searchPlaceholder: "Pesquisar por nome ou número do utente...",

    emptyTitle: "Nenhum utente corresponde à pesquisa.",
    emptyDescription:
      "Altera a pesquisa para encontrares outro utente deste pedido.",

    resultsPrefix: "A mostrar",
    resultsSeparator: "de",
    resultsSuffix: "utentes",

    pageLabel: "Página",
    pageSeparator: "de",
  },

  itemsList: {
    pageSize: 10,

    searchLabel: "Pesquisar medicamentos",
    searchPlaceholder: "Pesquisar por medicamento, receita ou PIN...",

    filtersLabel: "Filtrar medicamentos por tipo",

    emptyTitle: "Nenhum medicamento corresponde à pesquisa.",
    emptyDescription:
      "Altera a pesquisa ou seleciona outro tipo de medicamento.",

    resultsPrefix: "A mostrar",
    resultsSeparator: "de",
    resultsSuffix: "medicamentos",

    pageLabel: "Página",
    pageSeparator: "de",
  },

  labels: {
    pedido: "Pedido",
    pedidoNumber: "N.º pedido",

    createdAt: "Criado em",
    updatedAt: "Atualizado em",
    validatedAt: "Validado em",
    rejectedAt: "Rejeitado em",
    closedAt: "Decidido em",

    closedReason: "Motivo",
    rejectionReason: "Motivo da rejeição",

    status: "Estado",

    utente: "Utente",
    utentes: "Utentes do pedido",
    utenteNumber: "N.º utente",
    totalUtentes: "Total de utentes",

    medicamento: "Medicamento",
    quantidade: "Quantidade",
    requestedQuantity: "Quantidade solicitada",
    totalQuantity: "Quantidade total",
    validade: "Validade",

    tipo: "Tipo",

    receita: "Receita",
    receitaNumber: "N.º receita",
    receitaPins: "PINs",
    receitaCodes: "Códigos da receita",
    pinAcesso: "PIN acesso",
    pinOpcao: "PIN opção",

    semReceita: "Medicamentos não sujeitos a receita médica",
    extra: "Venda Suspensa",

    items: "Itens do pedido",
    itemSingular: "item",
    itemPlural: "itens",
    totalItems: "Total de itens",
  },
});
