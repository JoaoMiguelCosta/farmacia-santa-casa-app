import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { createUtente, deleteUtente, getUtentes } from "../api/utentesApi";

import { UTENTES_PAGE } from "../config/utentesPage.config";
import { sortUtentesByName } from "../utils/sortUtentes";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useSantaCasaUtentes() {
  const { handleAuthError } = useAuth();

  const [utentes, setUtentes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [deletingUtenteId, setDeletingUtenteId] = useState(null);
  const [utenteToDelete, setUtenteToDelete] = useState(null);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleRefreshUtentes = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await getUtentes();

      setUtentes(sortUtentesByName(data));
    } catch (requestError) {
      if (handleAuthError(requestError)) return;

      setError(getErrorMessage(requestError, "Erro ao carregar utentes."));
    } finally {
      setIsRefreshing(false);
    }
  }, [handleAuthError]);

  const handleCreateUtente = useCallback(
    async (payload) => {
      setIsCreating(true);
      setFeedback(null);

      try {
        const createdUtente = await createUtente(payload);

        setUtentes((currentUtentes) =>
          sortUtentesByName([createdUtente, ...currentUtentes]),
        );

        setError(null);

        setFeedback({
          type: "success",
          message: UTENTES_PAGE.form.successMessage,
        });

        return {
          ok: true,
          fieldErrors: {},
        };
      } catch (requestError) {
        if (handleAuthError(requestError)) {
          return {
            ok: false,
            fieldErrors: {},
          };
        }

        setFeedback({
          type: "error",
          message: getErrorMessage(requestError, "Erro ao criar utente."),
        });

        return {
          ok: false,
          fieldErrors: {},
        };
      } finally {
        setIsCreating(false);
      }
    },
    [handleAuthError],
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
        message: UTENTES_PAGE.list.deleteSuccessMessage,
      });

      setUtenteToDelete(null);
    } catch (requestError) {
      if (handleAuthError(requestError)) return;

      setFeedback({
        type: "error",
        message: getErrorMessage(requestError, "Erro ao remover utente."),
      });
    } finally {
      setDeletingUtenteId(null);
    }
  }, [handleAuthError, utenteToDelete]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUtentes() {
      try {
        const data = await getUtentes();

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
  }, [handleAuthError]);

  return {
    utentes,

    isLoading,
    isRefreshing,
    isCreating,

    deletingUtenteId,
    utenteToDelete,

    error,
    feedback,
    setFeedback,

    handleRefreshUtentes,
    handleCreateUtente,

    handleRequestDeleteUtente,
    handleCancelDeleteUtente,
    handleConfirmDeleteUtente,
  };
}
