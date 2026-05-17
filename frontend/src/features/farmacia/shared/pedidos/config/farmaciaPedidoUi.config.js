export const FARMACIA_PEDIDO_UI = Object.freeze({
  actions: {
    refresh: "Atualizar",
    refreshing: "A atualizar...",
    validate: "Validar pedido",
    validating: "A validar...",
    reject: "Rejeitar pedido",
    rejecting: "A rejeitar...",
    viewDetails: "Ver detalhes",
    hideDetails: "Ocultar detalhes",
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
    SEM_RECEITA: "Sem receita",
    EXTRA: "Extra",
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
    utenteNumber: "N.º utente",
    medicamento: "Medicamento",
    quantidade: "Quantidade",
    tipo: "Tipo",
    receita: "Receita",
    receitaNumber: "N.º receita",
    receitaPins: "PINs",
    semReceita: "Sem receita",
    extra: "Extra",
    items: "Itens",
    totalItems: "Total de itens",
  },
});
