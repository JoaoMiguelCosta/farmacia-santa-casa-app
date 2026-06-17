// src/features/farmacia/historico/config/farmaciaHistoricoPage.config.js
export const FARMACIA_HISTORICO_PAGE = Object.freeze({
  header: {
    eyebrow: "Farmácia",
    title: "Histórico de pedidos",
    description:
      "Consulta os pedidos concluídos pela Farmácia, incluindo a decisão, o responsável e o motivo quando aplicável.",
  },

  detail: {
    backLabel: "Voltar ao histórico",

    eyebrow: "Farmácia",
    title: "Detalhe do pedido concluído",
    description:
      "Consulta os utentes, medicamentos, receitas e dados da decisão deste pedido.",

    refreshLabel: "Atualizar pedido",
    refreshingLabel: "A atualizar...",

    loadingTitle: "A carregar pedido...",

    loadingDescription:
      "Aguarda enquanto os dados históricos do pedido são carregados.",

    errorTitle: "Não foi possível carregar o pedido.",

    retryLabel: "Tentar novamente",
  },

  sections: {
    history: {
      title: "Pedidos concluídos",

      description:
        "Pedidos já tratados pela Farmácia, organizados pela data da decisão.",

      updatingLabel: "A atualizar o histórico...",

      emptyTitle: "Sem pedidos no histórico.",

      emptyDescription:
        "Os pedidos validados, rejeitados ou cancelados ficam disponíveis nesta área.",

      loadingTitle: "A carregar histórico...",

      loadingDescription:
        "Aguarda enquanto os pedidos concluídos são carregados.",

      errorTitle: "Não foi possível carregar o histórico.",
    },
  },

  filters: {
    ariaLabel: "Filtros do histórico de pedidos",

    statusLabel: "Estado",

    searchLabel: "Pesquisa",

    searchPlaceholder:
      "Pesquisar por pedido, utente, medicamento, receita ou PIN...",

    fromLabel: "Data inicial",
    toLabel: "Data final",

    submit: "Filtrar",
    clear: "Limpar",

    totalSingular: "pedido encontrado",

    totalPlural: "pedidos encontrados",

    validation: {
      dateRange: "A data inicial não pode ser posterior à data final.",
    },

    options: [
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
    ],
  },

  pagination: {
    ariaLabel: "Paginação do histórico de pedidos",

    emptyLabel: "Sem resultados.",

    resultsPrefix: "A mostrar",
    resultsSeparator: "de",

    resultSingular: "pedido",
    resultPlural: "pedidos",

    pageLabel: "Página",
    pageSeparator: "de",

    previousLabel: "Anterior",
    nextLabel: "Seguinte",
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
  },
});
