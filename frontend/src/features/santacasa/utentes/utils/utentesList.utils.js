// src/features/santacasa/utentes/utils/utentesList.utils.js
import { formatDateTime } from "../../../../shared/utils/formatDate";

import {
  UTENTE_LIST_FALLBACKS,
  UTENTE_STATUS,
  UTENTE_STATUS_LABELS,
} from "../config/utentesStatus.config";

export function getUtenteStatus(utente) {
  return String(utente?.status || "").toUpperCase();
}

export function isUtenteArchived(utente) {
  return getUtenteStatus(utente) === UTENTE_STATUS.ARQUIVADO;
}

export function getUtenteStatusVariant(utente) {
  if (isUtenteArchived(utente)) {
    return "archived";
  }

  if (!utente?.isValid) {
    return "invalid";
  }

  return "active";
}

export function getUtenteStatusLabel(utente) {
  const status = getUtenteStatus(utente);

  if (UTENTE_STATUS_LABELS[status]) {
    return UTENTE_STATUS_LABELS[status];
  }

  return utente?.isValid
    ? UTENTE_LIST_FALLBACKS.activeLabel
    : UTENTE_LIST_FALLBACKS.invalidLabel;
}

export function getUtenteDateLabel(utente) {
  if (isUtenteArchived(utente)) {
    return utente.archivedAt
      ? formatDateTime(utente.archivedAt)
      : UTENTE_LIST_FALLBACKS.missingArchivedDate;
  }

  return formatDateTime(utente.createdAt);
}

export function getUtenteArchiveDetails(utente) {
  if (!isUtenteArchived(utente)) return null;

  const parts = [];

  if (utente.archivedReason) {
    parts.push(utente.archivedReason);
  }

  if (utente.archivedBy?.name || utente.archivedBy?.email) {
    parts.push(
      `${UTENTE_LIST_FALLBACKS.archivedByPrefix}: ${
        utente.archivedBy.name || utente.archivedBy.email
      }`,
    );
  }

  return parts.join(" · ");
}

export function getUtenteActionAriaLabel(prefix, utente) {
  return `${prefix} ${utente?.nome || ""}`.trim();
}
