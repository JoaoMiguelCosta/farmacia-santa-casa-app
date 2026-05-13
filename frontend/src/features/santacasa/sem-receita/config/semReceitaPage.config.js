export const SEM_RECEITA_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Sem Receita",
    description:
      "Regista e consulta medicamentos sem receita associados a cada utente.",
  },

  form: {
    title: "Adicionar medicamento sem receita",
    description:
      "Regista um medicamento disponível para o utente selecionado, sem ligação a receita oficial.",
    submitLabel: "Adicionar medicamento",
    submittingLabel: "A adicionar...",
    successMessage: "Medicamento sem receita criado com sucesso.",
  },

  list: {
    title: "Medicamentos sem receita disponíveis",
    description:
      "Lista de medicamentos sem receita com quantidade restante para o utente selecionado.",
    emptyTitle: "Sem medicamentos sem receita disponíveis.",
    emptyDescription:
      "Adiciona um medicamento sem receita ou seleciona outro utente.",
    loadingTitle: "A carregar medicamentos sem receita...",
    errorTitle: "Não foi possível carregar os medicamentos sem receita.",
    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Medicamento sem receita removido com sucesso.",
  },

  deleteDialog: {
    title: "Remover medicamento sem receita?",
    description:
      "Esta ação pode ser bloqueada se o medicamento já estiver associado a pedidos.",
    confirmLabel: "Remover medicamento",
    cancelLabel: "Cancelar",
  },

  fields: {
    medicamento: {
      id: "sem-receita-medicamento",
      label: "Medicamento",
      hint: "Indica o nome do medicamento.",
      placeholder: "Ex: Ben-u-ron",
    },
    quantidade: {
      id: "sem-receita-quantidade",
      label: "Quantidade",
      hint: "Deve ser um número inteiro maior que 0.",
      placeholder: "Ex: 2",
    },
  },
});
