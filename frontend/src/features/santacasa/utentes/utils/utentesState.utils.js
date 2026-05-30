// src/features/santacasa/utentes/utils/utentesState.utils.js
import {
  UTENTE_ARCHIVE_DEFAULT_REASON,
  UTENTE_STATUS,
} from "../config/utentesStatus.config";

export const UTENTES_DEFAULTS = Object.freeze({
  statusFilter: UTENTE_STATUS.ATIVO,
  pageSize: 50,
});

export function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function buildArchivePayload({
  archivedReason = UTENTE_ARCHIVE_DEFAULT_REASON,
} = {}) {
  return {
    archivedReason: archivedReason || UTENTE_ARCHIVE_DEFAULT_REASON,
  };
}

export function buildInitialPagination() {
  return {
    total: 0,
    skip: 0,
    take: UTENTES_DEFAULTS.pageSize,
  };
}

export function normalizePaginationParams(params = {}) {
  return {
    total: Number(params.total) || 0,
    skip: Number(params.skip) || 0,
    take: Number(params.take) || UTENTES_DEFAULTS.pageSize,
  };
}

export function getCurrentPage(pagination) {
  const totalPages = getTotalPages(pagination);

  return Math.min(
    totalPages,
    Math.floor(pagination.skip / pagination.take) + 1,
  );
}

export function getTotalPages(pagination) {
  return Math.max(1, Math.ceil(pagination.total / pagination.take));
}

export function hasPreviousPage(pagination) {
  return pagination.skip > 0;
}

export function hasNextPage(pagination) {
  return pagination.skip + pagination.take < pagination.total;
}

export function getPreviousPageSkip(pagination) {
  return Math.max(0, pagination.skip - pagination.take);
}

export function getNextPageSkip(pagination) {
  const nextSkip = pagination.skip + pagination.take;

  if (nextSkip >= pagination.total) {
    return pagination.skip;
  }

  return nextSkip;
}

export function shouldKeepUtenteInCurrentFilter(utente, statusFilter) {
  if (!utente) return false;
  if (statusFilter === UTENTE_STATUS.TODOS) return true;

  return utente.status === statusFilter;
}

export function doesUtenteMatchSearch(utente, searchQuery) {
  const search = String(searchQuery || "")
    .trim()
    .toLowerCase();

  if (!search) return true;

  return (
    String(utente?.nome || "")
      .toLowerCase()
      .includes(search) || String(utente?.numero9 || "").includes(search)
  );
}
