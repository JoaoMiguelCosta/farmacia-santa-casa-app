// src/features/santacasa/utentes/config/utentesPage.config.js
export const UTENTES_PAGE = Object.freeze({
  page: {
    titleId: "utentes-title",
    searchInputId: "utentes-search",
  },

  header: {
    eyebrow: "Santa Casa",
    title: "Utentes",
    description:
      "Cria, consulta, arquiva, reativa e remove registos de utentes conforme as regras operacionais do sistema.",
    refreshLabel: "Atualizar lista",
    refreshingLabel: "A atualizar...",
  },

  toolbar: {
    ariaLabel: "Filtros de utentes",

    statusLabel: "Estado dos utentes",

    searchLabel: "Pesquisa",
    searchPlaceholder: "Nome ou número de utente",
    searchSubmitLabel: "Pesquisar",
    searchClearLabel: "Limpar",
  },

  pagination: {
    ariaLabel: "Paginação de utentes",
    emptyLabel: "Sem resultados.",
    infoLabel: ({ start, end, total, currentPage, totalPages }) =>
      `A mostrar ${start}-${end} de ${total} utente(s). Página ${currentPage} de ${totalPages}.`,
    previousLabel: "Anterior",
    nextLabel: "Seguinte",
  },

  dialogs: {
    cancelLabel: "Cancelar",
    utentePrefix: "Utente",
  },

  form: {
    title: "Criar utente",
    description:
      "Regista um novo utente com número de 9 dígitos e nome completo. Se já existir um utente ativo ou arquivado com o mesmo número ou nome, a criação será bloqueada.",
    submitLabel: "Criar utente",
    submittingLabel: "A criar...",
    successMessage: "Utente criado com sucesso.",
    errorMessage: "Erro ao criar utente.",

    errors: {
      numero9Invalid: "O número deve ter exatamente 9 dígitos.",
      nomeRequired: "O nome é obrigatório.",
    },
  },

  list: {
    title: "Lista de utentes",
    description:
      "Consulta utentes ativos, arquivados ou todos os registos disponíveis conforme o filtro selecionado.",

    emptyTitle: "Não existem utentes para este filtro.",
    emptyDescription: "Altera o filtro ou cria um novo utente para continuar.",

    errorTitle: "Não foi possível carregar os utentes.",
    errorMessage: "Erro ao carregar utentes.",
    loadingTitle: "A carregar utentes...",
    loadingDescription: "Aguarda enquanto os dados são carregados.",

    retryLabel: "Tentar novamente",

    caption: "Lista de utentes registados",

    columns: {
      utente: "Utente",
      numero: "Número",
      estado: "Estado",
      dataMotivo: "Data / Motivo",
      acoes: "Ações",
    },

    archiveLabel: "Arquivar",
    archivingLabel: "A arquivar...",

    reactivateLabel: "Reativar",
    reactivatingLabel: "A reativar...",

    deleteLabel: "Remover registo",
    deletingLabel: "A remover...",
    deleteSuccessMessage: "Registo removido com sucesso.",

    ariaLabels: {
      archivePrefix: "Arquivar utente",
      reactivatePrefix: "Reativar utente",
      deletePrefix: "Remover registo do utente",
    },
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
