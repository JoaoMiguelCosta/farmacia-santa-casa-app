// src/features/santacasa/utentes/hooks/useSantaCasaUtentes.js
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  archiveUtente,
  createUtente,
  deleteUtente,
  getUtentes,
  reactivateUtente,
} from "../api/utentesApi";

import { UTENTES_PAGE } from "../config/utentesPage.config";

import {
  UTENTE_ACTION_MESSAGES,
  UTENTE_ARCHIVE_DEFAULT_REASON,
  UTENTE_STATUS,
  UTENTE_STATUS_FILTER_OPTIONS,
} from "../config/utentesStatus.config";

import { sortUtentesByName } from "../utils/sortUtentes";

const DEFAULT_STATUS_FILTER = UTENTE_STATUS.ATIVO;

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function buildArchivePayload({
  archivedReason = UTENTE_ARCHIVE_DEFAULT_REASON,
} = {}) {
  return {
    archivedReason: archivedReason || UTENTE_ARCHIVE_DEFAULT_REASON,
  };
}

function replaceUtenteInList(currentUtentes, updatedUtente) {
  if (!updatedUtente?.id) return currentUtentes;

  const existsInList = currentUtentes.some(
    (utente) => utente.id === updatedUtente.id,
  );

  if (!existsInList) return currentUtentes;

  return sortUtentesByName(
    currentUtentes.map((utente) =>
      utente.id === updatedUtente.id ? updatedUtente : utente,
    ),
  );
}

function shouldKeepUtenteInCurrentFilter(utente, statusFilter) {
  if (!utente) return false;
  if (statusFilter === UTENTE_STATUS.TODOS) return true;

  return utente.status === statusFilter;
}

export function useSantaCasaUtentes() {
  const { handleAuthError } = useAuth();

  const [utentes, setUtentes] = useState([]);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [deletingUtenteId, setDeletingUtenteId] = useState(null);
  const [archivingUtenteId, setArchivingUtenteId] = useState(null);
  const [reactivatingUtenteId, setReactivatingUtenteId] = useState(null);

  const [utenteToDelete, setUtenteToDelete] = useState(null);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const hasUtentes = utentes.length > 0;

  const isActionRunning = useMemo(() => {
    return Boolean(
      deletingUtenteId || archivingUtenteId || reactivatingUtenteId,
    );
  }, [archivingUtenteId, deletingUtenteId, reactivatingUtenteId]);

  const loadUtentes = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await getUtentes({
          status: statusFilter,
        });

        setUtentes(sortUtentesByName(data));
      } catch (requestError) {
        if (handleAuthError(requestError)) return;

        setError(getErrorMessage(requestError, "Erro ao carregar utentes."));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleAuthError, statusFilter],
  );

  const handleRefreshUtentes = useCallback(async () => {
    await loadUtentes({ showRefreshing: true });
  }, [loadUtentes]);

  const updateStatusFilter = useCallback((nextStatus) => {
    setStatusFilter(nextStatus || DEFAULT_STATUS_FILTER);
    setFeedback(null);
    setError(null);
  }, []);

  const handleCreateUtente = useCallback(
    async (payload) => {
      setIsCreating(true);
      setFeedback(null);

      try {
        const createdUtente = await createUtente(payload);

        if (shouldKeepUtenteInCurrentFilter(createdUtente, statusFilter)) {
          setUtentes((currentUtentes) =>
            sortUtentesByName([createdUtente, ...currentUtentes]),
          );
        }

        setError(null);

        setFeedback({
          type: "success",
          message: UTENTES_PAGE.form.successMessage,
        });

        return {
          ok: true,
          fieldErrors: {},
          message: null,
        };
      } catch (requestError) {
        if (handleAuthError(requestError)) {
          return {
            ok: false,
            fieldErrors: {},
            message: null,
          };
        }

        const message = getErrorMessage(requestError, "Erro ao criar utente.");

        setFeedback({
          type: "error",
          message,
        });

        return {
          ok: false,
          fieldErrors: {},
          message,
        };
      } finally {
        setIsCreating(false);
      }
    },
    [handleAuthError, statusFilter],
  );

  const handleArchiveUtente = useCallback(
    async (utente, options = {}) => {
      if (!utente?.id) {
        setFeedback({
          type: "error",
          message: UTENTE_ACTION_MESSAGES.invalidUtente,
        });

        return null;
      }

      const payload = buildArchivePayload(options);

      setArchivingUtenteId(utente.id);
      setFeedback(null);

      try {
        const updatedUtente = await archiveUtente(utente.id, payload);

        setUtentes((currentUtentes) => {
          if (!shouldKeepUtenteInCurrentFilter(updatedUtente, statusFilter)) {
            return currentUtentes.filter(
              (currentUtente) => currentUtente.id !== updatedUtente.id,
            );
          }

          return replaceUtenteInList(currentUtentes, updatedUtente);
        });

        setFeedback({
          type: "success",
          message: UTENTE_ACTION_MESSAGES.archiveSuccess,
        });

        return updatedUtente;
      } catch (requestError) {
        if (handleAuthError(requestError)) return null;

        setFeedback({
          type: "error",
          message: getErrorMessage(
            requestError,
            UTENTE_ACTION_MESSAGES.archiveError,
          ),
        });

        return null;
      } finally {
        setArchivingUtenteId(null);
      }
    },
    [handleAuthError, statusFilter],
  );

  const handleReactivateUtente = useCallback(
    async (utente) => {
      if (!utente?.id) {
        setFeedback({
          type: "error",
          message: UTENTE_ACTION_MESSAGES.invalidUtente,
        });

        return null;
      }

      setReactivatingUtenteId(utente.id);
      setFeedback(null);

      try {
        const updatedUtente = await reactivateUtente(utente.id);

        setUtentes((currentUtentes) => {
          if (!shouldKeepUtenteInCurrentFilter(updatedUtente, statusFilter)) {
            return currentUtentes.filter(
              (currentUtente) => currentUtente.id !== updatedUtente.id,
            );
          }

          return replaceUtenteInList(currentUtentes, updatedUtente);
        });

        setFeedback({
          type: "success",
          message: UTENTE_ACTION_MESSAGES.reactivateSuccess,
        });

        return updatedUtente;
      } catch (requestError) {
        if (handleAuthError(requestError)) return null;

        setFeedback({
          type: "error",
          message: getErrorMessage(
            requestError,
            UTENTE_ACTION_MESSAGES.reactivateError,
          ),
        });

        return null;
      } finally {
        setReactivatingUtenteId(null);
      }
    },
    [handleAuthError, statusFilter],
  );

  const handleRequestDeleteUtente = useCallback((utente) => {
    setUtenteToDelete(utente);
    setFeedback(null);
  }, []);

  const handleCancelDeleteUtente = useCallback(() => {
    if (deletingUtenteId) return;

    setUtenteToDelete(null);
  }, [deletingUtenteId]);

  const handleConfirmDeleteUtente = useCallback(async () => {
    if (!utenteToDelete) return;

    setDeletingUtenteId(utenteToDelete.id);
    setFeedback(null);

    try {
      await deleteUtente(utenteToDelete.id);

      setUtentes((currentUtentes) =>
        currentUtentes.filter(
          (currentUtente) => currentUtente.id !== utenteToDelete.id,
        ),
      );

      setFeedback({
        type: "success",
        message: UTENTE_ACTION_MESSAGES.deleteSuccess,
      });

      setUtenteToDelete(null);
    } catch (requestError) {
      if (handleAuthError(requestError)) return;

      setFeedback({
        type: "error",
        message: getErrorMessage(
          requestError,
          UTENTE_ACTION_MESSAGES.deleteError,
        ),
      });
    } finally {
      setDeletingUtenteId(null);
    }
  }, [handleAuthError, utenteToDelete]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUtentes() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getUtentes({
          status: statusFilter,
        });

        if (!isMounted) return;

        setUtentes(sortUtentesByName(data));
        setError(null);
      } catch (requestError) {
        if (!isMounted) return;
        if (handleAuthError(requestError)) return;

        setError(getErrorMessage(requestError, "Erro ao carregar utentes."));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialUtentes();

    return () => {
      isMounted = false;
    };
  }, [handleAuthError, statusFilter]);

  return {
    utentes,
    hasUtentes,

    statusFilter,
    statusOptions: UTENTE_STATUS_FILTER_OPTIONS,

    isLoading,
    isRefreshing,
    isCreating,
    isActionRunning,

    deletingUtenteId,
    archivingUtenteId,
    reactivatingUtenteId,

    utenteToDelete,

    error,
    feedback,
    setFeedback,

    loadUtentes,
    handleRefreshUtentes,
    updateStatusFilter,

    handleCreateUtente,
    handleArchiveUtente,
    handleReactivateUtente,

    handleRequestDeleteUtente,
    handleCancelDeleteUtente,
    handleConfirmDeleteUtente,
  };
}
