export const EXTRAS_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Vendas Suspensas",
    description:
      "Regista e acompanha vendas suspensas que precisam de regularização futura por receita.",
  },

  form: {
    title: "Criar Venda Suspensa",
    description:
      "Regista um medicamento entregue no momento como venda suspensa, para posterior regularização por receita.",
    submitLabel: "Criar Venda Suspensa",
    submittingLabel: "A criar...",
    successMessage: "Venda Suspensa criada com sucesso.",
  },

  list: {
    title: "Vendas suspensas em aberto",
    description:
      "Lista de vendas suspensas com quantidade restante por regularizar para o utente selecionado.",
    emptyTitle: "Sem vendas suspensas em aberto.",
    emptyDescription: "Cria uma venda suspensa ou seleciona outro utente.",
    loadingTitle: "A carregar vendas suspensas...",
    errorTitle: "Não foi possível carregar as vendas suspensas.",
    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Venda Suspensa removida com sucesso.",
  },

  deleteDialog: {
    title: "Remover Venda Suspensa?",
    description:
      "Esta ação pode ser bloqueada se a venda suspensa já estiver associada a pedidos, dispensas ou regularizações.",
    confirmLabel: "Remover Venda Suspensa",
    cancelLabel: "Cancelar",
  },

  fields: {
    medicamento: {
      id: "extra-medicamento",
      label: "Medicamento",
      hint: "Indica o nome do medicamento entregue.",
      placeholder: "Ex: Cipralex 30mg",
    },
    quantidadeSolicitada: {
      id: "extra-quantidade-solicitada",
      label: "Quantidade solicitada",
      hint: "Deve ser um número inteiro maior que 0.",
      placeholder: "Ex: 3",
    },
  },
});
