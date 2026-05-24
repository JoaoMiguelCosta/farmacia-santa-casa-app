export const FARMACIA_PEDIDOS_PAGE = Object.freeze({
  header: {
    eyebrow: "Farmácia",
    title: "Pedidos",
    description:
      "Consulta, valida ou rejeita pedidos enviados pela Santa Casa para dispensa na Farmácia.",
  },

  sections: {
    list: {
      title: "Pedidos pendentes",
      description:
        "Lista de pedidos aguardando validação, rejeição ou confirmação de disponibilidade.",
      emptyTitle: "Sem pedidos pendentes.",
      emptyDescription:
        "Quando a Santa Casa enviar novos pedidos, eles aparecem nesta lista.",
      loadingTitle: "A carregar pedidos...",
      errorTitle: "Não foi possível carregar os pedidos.",
    },
  },

  validateDialog: {
    title: "Validar pedido?",
    description:
      "Ao validar, o backend vai dispensar quantidades, atualizar saldos e criar regularizações quando existirem vendas suspensas.",
    confirmLabel: "Validar pedido",
    cancelLabel: "Cancelar",
    successMessage: "Pedido validado com sucesso.",
  },

  rejectDialog: {
    title: "Rejeitar pedido?",
    description:
      "Ao rejeitar, todos os itens pendentes deste pedido passam para estado rejeitado e o motivo fica guardado no histórico.",
    confirmLabel: "Rejeitar pedido",
    cancelLabel: "Cancelar",
    successMessage: "Pedido rejeitado com sucesso.",
    reasonLabel: "Motivo da rejeição",
    reasonPlaceholder: "Ex: medicamento indisponível, dados inválidos...",
    reasonHint: "Opcional. Máximo recomendado: 500 caracteres.",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
    validateError: "Não foi possível validar o pedido.",
    rejectError: "Não foi possível rejeitar o pedido.",
  },

  labels: {
    pedido: "Pedido",
  },
});
