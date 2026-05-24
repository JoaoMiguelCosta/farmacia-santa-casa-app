export const SEM_RECEITA_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Medicamentos não sujeitos a receita médica",
    description:
      "Regista e consulta medicamentos não sujeitos a receita médica associados a cada utente.",
  },

  form: {
    title: "Adicionar medicamento não sujeito a receita médica",
    description:
      "Regista um medicamento disponível para o utente selecionado, sem ligação a receita oficial.",
    submitLabel: "Adicionar medicamento",
    submittingLabel: "A adicionar...",
    successMessage:
      "Medicamento não sujeito a receita médica criado com sucesso.",
  },

  list: {
    title: "Medicamentos não sujeitos a receita médica disponíveis",
    description:
      "Lista de medicamentos não sujeitos a receita médica com quantidade restante para o utente selecionado.",
    emptyTitle: "Sem medicamentos não sujeitos a receita médica disponíveis.",
    emptyDescription:
      "Adiciona um medicamento não sujeito a receita médica ou seleciona outro utente.",
    loadingTitle: "A carregar medicamentos não sujeitos a receita médica...",
    errorTitle:
      "Não foi possível carregar os medicamentos não sujeitos a receita médica.",
    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage:
      "Medicamento não sujeito a receita médica removido com sucesso.",
  },

  deleteDialog: {
    title: "Remover medicamento não sujeito a receita médica?",
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
