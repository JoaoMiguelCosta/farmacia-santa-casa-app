// src/features/santacasa/shared/pedidos/config/santaCasaPedidoDetails.config.js

export const SANTACASA_PEDIDO_DETAILS = Object.freeze({
  labels: Object.freeze({
    title: "Utentes do pedido",

    itemsAriaLabel: "Medicamentos do utente",
    barcodeAriaLabel: "Códigos da receita",

    utente: "Utente",
    numeroUtente: "N.º utente",

    totalItems: "Total de medicamentos",
    totalQuantity: "Quantidade total",

    itemSingular: "medicamento",
    itemPlural: "medicamentos",

    unidadeSingular: "unidade",
    unidadePlural: "unidades",

    requestedQuantity: "Quantidade solicitada",
    validadeReceita: "Validade",

    receitaCodes: "Códigos da receita",
    receitaNumber: "N.º receita",
    pinAcesso: "PIN acesso",
    pinOpcao: "PIN opção",

    emptyValue: "—",
  }),

  utentesList: Object.freeze({
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
  }),

  itemsList: Object.freeze({
    pageSize: 10,

    searchLabel: "Pesquisar medicamentos",

    searchPlaceholder: "Pesquisar por medicamento, receita, PIN ou estado...",

    filtersLabel: "Filtrar medicamentos por tipo",

    emptyTitle: "Nenhum medicamento corresponde à pesquisa.",

    emptyDescription:
      "Altera a pesquisa ou seleciona outro tipo de medicamento.",

    resultsPrefix: "A mostrar",
    resultsSeparator: "de",
    resultsSuffix: "medicamentos",

    pageLabel: "Página",
    pageSeparator: "de",
  }),

  itemFilters: Object.freeze({
    ALL: "Todos",
    COM_RECEITA: "Com receita",
    EXTRA: "Vendas Suspensas",

    SEM_RECEITA: "Não sujeitos a receita médica",
  }),

  itemWarnings: Object.freeze({
    expired: Object.freeze({
      pending: Object.freeze({
        title: "Medicamento cancelado por expiração",

        message:
          "A receita deste medicamento expirou antes da decisão da Farmácia. O medicamento já não está incluído na quantidade pendente.",
      }),

      history: Object.freeze({
        title: "Medicamento não dispensado",

        message:
          "Este medicamento não foi dispensado porque a receita expirou antes da decisão da Farmácia.",
      }),
    }),
  }),

  actions: Object.freeze({
    viewMedicamentos: "Ver medicamentos",
    hideMedicamentos: "Ocultar medicamentos",

    viewReceita: "Ver receita",
    hideReceita: "Ocultar receita",

    previousPage: "Anterior",
    nextPage: "Seguinte",
  }),
});
