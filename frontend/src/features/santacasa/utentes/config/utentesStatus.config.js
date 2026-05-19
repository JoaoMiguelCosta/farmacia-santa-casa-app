// src/features/santacasa/utentes/config/utentesStatus.config.js
export const UTENTE_STATUS = Object.freeze({
  ATIVO: "ATIVO",
  ARQUIVADO: "ARQUIVADO",
  TODOS: "TODOS",
});

export const UTENTE_STATUS_FILTER_OPTIONS = Object.freeze([
  {
    value: UTENTE_STATUS.ATIVO,
    label: "Ativos",
  },
  {
    value: UTENTE_STATUS.ARQUIVADO,
    label: "Arquivados",
  },
  {
    value: UTENTE_STATUS.TODOS,
    label: "Todos",
  },
]);

export const UTENTE_STATUS_LABELS = Object.freeze({
  [UTENTE_STATUS.ATIVO]: "Ativo",
  [UTENTE_STATUS.ARQUIVADO]: "Arquivado",
});

export const UTENTE_ARCHIVE_DEFAULT_REASON = "Arquivado pela Santa Casa.";

export const UTENTE_ACTION_MESSAGES = Object.freeze({
  archiveSuccess: "Utente arquivado com sucesso.",
  reactivateSuccess: "Utente reativado com sucesso.",
  deleteSuccess: "Registo removido com sucesso.",

  archiveError: "Erro ao arquivar utente.",
  reactivateError: "Erro ao reativar utente.",
  deleteError: "Erro ao remover registo.",
  invalidUtente: "Utente inválido.",
});

export const UTENTE_ACTION_DIALOGS = Object.freeze({
  archive: {
    title: "Arquivar utente",
    confirmLabel: "Arquivar utente",
    description:
      "O utente deixará de aparecer nas operações diárias. Só é possível arquivar se não existirem receitas ativas disponíveis, medicamentos sem receita disponíveis, Extras, pedidos ou regularizações pendentes. O histórico será mantido.",
  },

  reactivate: {
    title: "Reativar utente",
    confirmLabel: "Reativar utente",
    description:
      "O utente voltará a estar disponível para novas operações da Santa Casa.",
  },

  delete: {
    title: "Remover registo",
    confirmLabel: "Remover registo",
    description:
      "Só é possível remover utentes sem qualquer dado associado. Se existir histórico, receitas, medicamentos, pedidos, Extras, regularizações ou dispensas, a ação será bloqueada.",
  },
});
