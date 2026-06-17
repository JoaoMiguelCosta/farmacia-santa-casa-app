// src/features/santacasa/utentes/utils/utentesPage.utils.js
import { UTENTES_PAGE } from "../config/utentesPage.config";
import { UTENTE_ACTION_DIALOGS } from "../config/utentesStatus.config";

export const UTENTE_PAGE_ACTIONS = Object.freeze({
  ARCHIVE: "archive",
  REACTIVATE: "reactivate",
});

export function getUtenteActionDialogConfig(actionState) {
  if (!actionState?.type) {
    return UTENTE_ACTION_DIALOGS.archive;
  }

  return (
    UTENTE_ACTION_DIALOGS[actionState.type] || UTENTE_ACTION_DIALOGS.archive
  );
}

export function buildUtenteActionDescription(actionState) {
  const config = getUtenteActionDialogConfig(actionState);
  const utenteName = actionState?.utente?.nome;

  if (!utenteName) {
    return config.description;
  }

  return `${config.description} ${UTENTES_PAGE.dialogs.utentePrefix}: ${utenteName}.`;
}

export function buildUtenteDeleteDescription(utente) {
  if (!utente?.nome) {
    return UTENTE_ACTION_DIALOGS.delete.description;
  }

  return `${UTENTE_ACTION_DIALOGS.delete.description} ${UTENTES_PAGE.dialogs.utentePrefix}: ${utente.nome}.`;
}

export function getUtentesPaginationLabel({
  pagination,
  currentPage,
  totalPages,
}) {
  const total = Number(pagination?.total) || 0;
  const skip = Number(pagination?.skip) || 0;
  const take = Number(pagination?.take) || 0;

  if (total === 0) {
    return UTENTES_PAGE.pagination.emptyLabel;
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return UTENTES_PAGE.pagination.infoLabel({
    start,
    end,
    total,
    currentPage,
    totalPages,
  });
}
