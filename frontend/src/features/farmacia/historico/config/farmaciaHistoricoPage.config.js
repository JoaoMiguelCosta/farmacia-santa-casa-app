export const FARMACIA_HISTORICO_PAGE = Object.freeze({
  header: {
    eyebrow: "Farmácia",
    title: "Histórico de pedidos",
    description:
      "Consulta pedidos validados ou rejeitados pela Farmácia, incluindo motivo quando aplicável.",
  },

  sections: {
    history: {
      title: "Histórico",
      description:
        "Pedidos já tratados pela Farmácia, organizados por data de decisão.",
      emptyTitle: "Sem pedidos no histórico.",
      emptyDescription:
        "Quando validares ou rejeitares pedidos, eles aparecem aqui.",
      loadingTitle: "A carregar histórico...",
      errorTitle: "Não foi possível carregar o histórico.",
    },
  },

  filters: {
    statusLabel: "Estado",
    searchLabel: "Pesquisa",
    searchPlaceholder: "Pesquisar por pedido, utente ou medicamento...",
    fromLabel: "Data inicial",
    toLabel: "Data final",
    submit: "Filtrar",
    clear: "Limpar",
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

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
  },
});
