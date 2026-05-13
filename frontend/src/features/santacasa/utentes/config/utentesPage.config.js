export const UTENTES_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Utentes",
    description:
      "Cria, consulta e remove utentes ativos antes de associar receitas, medicamentos sem receita, Extras ou pedidos.",
  },

  form: {
    title: "Criar utente",
    description:
      "Regista um novo utente com número de 9 dígitos e nome completo.",
    submitLabel: "Criar utente",
    submittingLabel: "A criar...",
    successMessage: "Utente criado com sucesso.",
  },

  list: {
    title: "Utentes ativos",
    description: "Lista de utentes atualmente disponíveis para operação.",
    emptyTitle: "Ainda não existem utentes ativos.",
    emptyDescription:
      "Cria o primeiro utente para começar a testar receitas, medicamentos e pedidos.",
    errorTitle: "Não foi possível carregar os utentes.",
    loadingTitle: "A carregar utentes...",
    deleteLabel: "Remover",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Utente removido com sucesso.",
  },

  deleteDialog: {
    title: "Remover utente?",
    description:
      "Esta ação faz remoção lógica. O backend pode bloquear a operação se o utente tiver pendências, pedidos, Extras ou regularizações em aberto.",
    confirmLabel: "Remover utente",
    cancelLabel: "Cancelar",
  },

  fields: {
    numero9: {
      id: "numero9",
      label: "Número de utente",
      hint: "Deve conter exatamente 9 dígitos.",
      placeholder: "Ex: 111111111",
    },
    nome: {
      id: "nome",
      label: "Nome completo",
      hint: "Usa o nome completo do utente.",
      placeholder: "Ex: João Miguel Costa",
    },
  },
});
