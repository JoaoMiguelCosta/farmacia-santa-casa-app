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
      errorTitle: "Não foi possível carregar o histórico.",
    },
  },

  filters: {
    statusLabel: "Estado",
    searchLabel: "Pesquisa",
    searchPlaceholder:
      "Pesquisar por pedido, utente, medicamento ou receita...",
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
    closedAt: "Fechado em",

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

    semReceita: "Medicamento não sujeito a receita médica",
    extra: "Venda Suspensa",

    items: "Itens do pedido",
    totalItems: "Total de itens",
    totalQuantity: "Quantidade total",

    automaticCancellationNoticeTitle: "Cancelamento automático",
    manualCancellationNoticeTitle: "Cancelamento pela Santa Casa",
  },

  messages: {
    validated:
      "Este pedido foi validado pela Farmácia e os respetivos efeitos foram aplicados.",
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
