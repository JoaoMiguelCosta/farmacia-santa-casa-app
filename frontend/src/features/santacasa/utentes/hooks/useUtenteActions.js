// src/features/santacasa/utentes/hooks/useUtenteActions.js
import { useCallback, useMemo, useState } from "react";

import {
  archiveUtente,
  deleteUtente,
  reactivateUtente,
} from "../api/utentesApi";

import { UTENTE_ACTION_MESSAGES } from "../config/utentesStatus.config";

import {
  buildArchivePayload,
  getErrorMessage,
} from "../utils/utentesState.utils";

export function useUtenteActions({
  handleAuthError,
  loadUtentes,
  setFeedback,
}) {
  const [deletingUtenteId, setDeletingUtenteId] = useState(null);
  const [archivingUtenteId, setArchivingUtenteId] = useState(null);
  const [reactivatingUtenteId, setReactivatingUtenteId] = useState(null);

  const [utenteToDelete, setUtenteToDelete] = useState(null);

  const isActionRunning = useMemo(() => {
    return Boolean(
      deletingUtenteId || archivingUtenteId || reactivatingUtenteId,
    );
  }, [archivingUtenteId, deletingUtenteId, reactivatingUtenteId]);

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

        await loadUtentes({ showRefreshing: true });

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
    [handleAuthError, loadUtentes, setFeedback],
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

        await loadUtentes({ showRefreshing: true });

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
    [handleAuthError, loadUtentes, setFeedback],
  );

  const handleRequestDeleteUtente = useCallback(
    (utente) => {
      setUtenteToDelete(utente);
      setFeedback(null);
    },
    [setFeedback],
  );

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
      await loadUtentes({ showRefreshing: true });

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
  }, [handleAuthError, loadUtentes, setFeedback, utenteToDelete]);

  return {
    isActionRunning,

    deletingUtenteId,
    archivingUtenteId,
    reactivatingUtenteId,

    utenteToDelete,

    handleArchiveUtente,
    handleReactivateUtente,

    handleRequestDeleteUtente,
    handleCancelDeleteUtente,
    handleConfirmDeleteUtente,
  };
}
