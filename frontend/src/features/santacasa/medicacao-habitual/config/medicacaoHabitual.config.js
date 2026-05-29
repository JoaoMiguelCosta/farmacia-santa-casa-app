export const MEDICACAO_HABITUAL_CONFIG = Object.freeze({
  section: {
    title: "Medicação habitual",
    description:
      "Lista de medicamentos normalmente associados ao utente selecionado.",
    emptyTitle: "Sem medicação habitual registada.",
    emptyDescription:
      "Adiciona medicamentos usados com frequência para poderes selecioná-los mais rapidamente nas receitas, medicamentos não sujeitos a receita médica e vendas suspensas.",
    loadingTitle: "A carregar medicação habitual...",
    errorTitle: "Não foi possível carregar a medicação habitual.",
  },

  form: {
    title: "Adicionar medicamento",
    description:
      "Regista um medicamento habitual para reutilizar nos formulários da operação.",
    submitLabel: "Adicionar",
    submittingLabel: "A adicionar...",
    successMessage: "Medicamento adicionado à medicação habitual.",
  },

  fields: {
    medicamento: {
      id: "medicacao-habitual-medicamento",
      label: "Medicamento",
      placeholder: "Ex: Paracetamol 1000mg",
      hint: "Escreve o nome do medicamento usado habitualmente pelo utente.",
    },
  },

  list: {
    removeLabel: "Remover",
    removingLabel: "A remover...",
    clearLabel: "Limpar lista",
    clearSuccessMessage: "Medicação habitual limpa com sucesso.",
    deleteSuccessMessage: "Medicamento removido da medicação habitual.",
  },

  clearDialog: {
    title: "Limpar medicação habitual?",
    description:
      "Esta ação remove todos os medicamentos habituais deste utente. Não remove receitas, medicamentos não sujeitos a receita médica, vendas suspensas, pedidos ou histórico.",
    confirmLabel: "Limpar lista",
    cancelLabel: "Cancelar",
  },

  deleteDialog: {
    title: "Remover medicamento habitual?",
    description:
      "Esta ação remove apenas este medicamento da lista de medicação habitual do utente.",
    confirmLabel: "Remover",
    cancelLabel: "Cancelar",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
    missingUtente: "Seleciona um utente antes de gerir a medicação habitual.",
  },
});
