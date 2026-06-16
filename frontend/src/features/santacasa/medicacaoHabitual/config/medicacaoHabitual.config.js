// src/features/santacasa/medicacao-habitual/config/medicacaoHabitual.config.js
export const MEDICACAO_HABITUAL_CONFIG = Object.freeze({
  section: {
    title: "Medicação habitual",
    description:
      "Medicamentos que o utente toma com frequência e que podem ser reutilizados nos formulários.",
    emptyTitle: "Sem medicação habitual registada.",
    emptyDescription:
      "Adiciona os Medicamentos que o utente toma habitualmente para os poderes selecionar mais rapidamente em receitas, Medicamentos não sujeitos a receita médica e Medicamentos para venda suspensa.",
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
    title: "Adicionar Medicamento habitual",
    description:
      "Adiciona um Medicamento que o utente toma com frequência para o reutilizar nos formulários.",
    submitLabel: "Adicionar",
    submittingLabel: "A adicionar...",
    successMessage: "Medicamento habitual adicionado com sucesso.",
  },

  fields: {
    medicamento: {
      id: "medicacao-habitual-medicamento",
      label: "Medicamento",
      placeholder: "Ex: Paracetamol 1000mg",
      hint: "Escreve o nome do Medicamento usado habitualmente pelo utente.",
    },
  },

  list: {
    title: "Medicamentos habituais",
    description:
      "Sugestões disponíveis para preencher mais rapidamente os formulários da operação.",
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
      "Esta ação remove apenas a lista de Medicamentos habituais deste utente. Não remove receitas, Medicamentos não sujeitos a receita médica, Medicamentos para venda suspensa, pedidos ou histórico.",
    confirmLabel: "Limpar lista",
    cancelLabel: "Cancelar",
  },

  deleteDialog: {
    title: "Remover Medicamento habitual?",
    description:
      "Esta ação remove apenas este Medicamento da lista de medicação habitual do utente.",
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
    medicamentoRequired: "O Medicamento é obrigatório.",
    medicamentoMaxLength: "O Medicamento não pode exceder 160 caracteres.",
    duplicateMedicamento: "Este Medicamento já existe na medicação habitual.",
  },
});
