export const SANTACASA_HISTORICO_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Histórico",
    description:
      "Consulta o resultado dos pedidos enviados à Farmácia, incluindo validações, rejeições e respetivos motivos.",
  },

  sections: {
    list: {
      title: "Histórico de pedidos",
      description:
        "Pedidos já tratados pela Farmácia, organizados por data de decisão.",
      emptyTitle: "Sem pedidos no histórico.",
      emptyDescription:
        "Quando a Farmácia validar ou rejeitar pedidos, eles aparecem aqui.",
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
    ],
  },

  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
    viewDetails: "Ver detalhes",
    hideDetails: "Ocultar detalhes",
  },

  status: {
    VALIDADO: "Validado",
    REJEITADO: "Rejeitado",
    CANCELADO: "Cancelado",
  },

  itemStatus: {
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    REJEITADO: "Rejeitado",
    CANCELADO_POR_EXPIRACAO: "Cancelado por expiração",
  },

  itemTypes: {
    COM_RECEITA: "Com receita",
    SEM_RECEITA: "Sem receita",
    EXTRA: "Extra",
  },

  labels: {
    pedido: "Pedido",
    pedidoNumber: "N.º pedido",
    status: "Estado",

    createdAt: "Criado em",
    validatedAt: "Validado em",
    rejectedAt: "Rejeitado em",
    closedAt: "Decidido em",

    closedReason: "Motivo",
    rejectionReason: "Motivo da rejeição",
    cancellationReason: "Motivo do cancelamento",

    utente: "Utente",
    utenteNumber: "N.º utente",

    medicamento: "Medicamento",
    quantidade: "Quantidade",
    tipo: "Tipo",

    receita: "Receita",
    receitaNumber: "N.º receita",
    pinAcesso: "PIN de acesso",
    pinOpcao: "PIN de opção",

    semReceita: "Medicamento sem receita",
    extra: "Extra",

    items: "Itens do pedido",
    totalItems: "Total de itens",
    totalQuantity: "Quantidade total",
  },

  messages: {
    validated:
      "Este pedido foi validado pela Farmácia e os respetivos efeitos foram aplicados.",
    rejected:
      "Este pedido foi rejeitado pela Farmácia. Os itens deixaram de estar reservados.",
    cancelled: "Este pedido foi cancelado e deixou de estar pendente.",
    noReason: "Sem motivo registado.",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
  },
});
