// src/features/santacasa/utentes/config/utentesPage.config.js
export const UTENTES_PAGE = Object.freeze({
  header: {
    eyebrow: "Santa Casa",
    title: "Utentes",
    description:
      "Cria, consulta, arquiva, reativa e remove registos de utentes conforme as regras operacionais do sistema.",
  },

  form: {
    title: "Criar utente",
    description:
      "Regista um novo utente com número de 9 dígitos e nome completo. Se já existir um utente ativo ou arquivado com o mesmo número ou nome, a criação será bloqueada.",
    submitLabel: "Criar utente",
    submittingLabel: "A criar...",
    successMessage: "Utente criado com sucesso.",
  },

  list: {
    title: "Lista de utentes",
    description:
      "Consulta utentes ativos, arquivados ou todos os registos disponíveis conforme o filtro selecionado.",
    emptyTitle: "Não existem utentes para este filtro.",
    emptyDescription: "Altera o filtro ou cria um novo utente para continuar.",
    errorTitle: "Não foi possível carregar os utentes.",
    loadingTitle: "A carregar utentes...",

    archiveLabel: "Arquivar",
    archivingLabel: "A arquivar...",

    reactivateLabel: "Reativar",
    reactivatingLabel: "A reativar...",

    deleteLabel: "Remover registo",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Registo removido com sucesso.",
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
