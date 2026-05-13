export const EXTRAS_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Extras",
    description:
      "Regista e acompanha vendas suspensas que precisam de regularização futura por receita.",
  },

  form: {
    title: "Criar Extra",
    description:
      "Regista um medicamento entregue sem receita no momento, para posterior regularização.",
    submitLabel: "Criar Extra",
    submittingLabel: "A criar...",
    successMessage: "Extra criado com sucesso.",
  },

  list: {
    title: "Extras em aberto",
    description:
      "Lista de Extras com quantidade restante por regularizar para o utente selecionado.",
    emptyTitle: "Sem Extras em aberto.",
    emptyDescription: "Cria um Extra ou seleciona outro utente.",
    loadingTitle: "A carregar Extras...",
    errorTitle: "Não foi possível carregar os Extras.",
    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Extra removido com sucesso.",
  },

  deleteDialog: {
    title: "Remover Extra?",
    description:
      "Esta ação pode ser bloqueada se o Extra já estiver associado a pedidos, dispensas ou regularizações.",
    confirmLabel: "Remover Extra",
    cancelLabel: "Cancelar",
  },

  fields: {
    medicamento: {
      id: "extra-medicamento",
      label: "Medicamento",
      hint: "Indica o nome do medicamento entregue.",
      placeholder: "Ex: Medicamento Extra Teste",
    },
    quantidadeSolicitada: {
      id: "extra-quantidade-solicitada",
      label: "Quantidade solicitada",
      hint: "Deve ser um número inteiro maior que 0.",
      placeholder: "Ex: 3",
    },
  },
});
