// src/features/santacasa/medicacao-habitual/config/medicacaoHabitual.config.js
export const MEDICACAO_HABITUAL_CONFIG = Object.freeze({
  section: {
    title: "Medicação habitual",
    description:
      "Lista de medicamentos normalmente associados ao utente selecionado.",
    emptyTitle: "Sem medicação habitual registada.",
    emptyDescription:
      "Adiciona medicamentos usados com frequência para poderes selecioná-los mais rapidamente nas receitas, medicamentos não sujeitos a receita médica e vendas suspensas.",
    loadingTitle: "A carregar medicação habitual...",
    loadingDescription: "Aguarda enquanto a medicação habitual é carregada.",
    errorTitle: "Não foi possível carregar a medicação habitual.",
    retryLabel: "Tentar novamente",
    noUtenteTitle: "Seleciona um utente.",
    noUtenteDescription:
      "Depois de selecionares um utente, podes gerir a medicação habitual.",
  },

  context: {
    selectedUtenteLabel: "Utente selecionado",
    nameLabel: "Nome",
    numberLabel: "N.º utente",
    selectedUtenteFallback: "Utente selecionado",
    numberFallback: "—",
  },

  actions: {
    refreshLabel: "Atualizar",
    refreshingLabel: "A atualizar...",
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
    title: "Medicamentos registados",
    description: "Sugestões disponíveis nos formulários da operação.",
    itemLabel: "Medicamento",
    createdAtLabel: "Criado em",
    removeLabel: "Remover",
    removingLabel: "A remover...",
    clearLabel: "Limpar lista",
    clearSuccessMessage: "Medicação habitual limpa com sucesso.",
    deleteSuccessMessage: "Medicamento removido da medicação habitual.",
    removeAriaLabelPrefix: "Remover",
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
    medicationPrefix: "Medicamento:",
    emptyMedication: "—",
  },

  feedback: {
    genericError: "Ocorreu um erro inesperado.",
    missingUtente: "Seleciona um utente antes de gerir a medicação habitual.",
  },

  validation: {
    medicamentoRequired: "O medicamento é obrigatório.",
    medicamentoMaxLength: "O medicamento não pode exceder 160 caracteres.",
    duplicateMedicamento: "Este medicamento já existe na medicação habitual.",
  },
});
