// src/features/santacasa/medicacao-habitual/hooks/useMedicacaoHabitualLoader.js
import { useCallback, useEffect, useState } from "react";

import { getMedicacaoHabitualByUtente } from "../api/medicacaoHabitualApi";

import { MEDICACAO_HABITUAL_CONFIG } from "../config/medicacaoHabitual.config";

import { sortMedicacaoHabitualByName } from "../utils/medicacaoHabitual.utils";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useMedicacaoHabitualLoader({
  selectedUtenteId,
  setMedicacoes,
  handleAuthError,
  onResetForUtenteChange,
}) {
  const [isLoading, setIsLoading] = useState(Boolean(selectedUtenteId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const setSortedMedicacoes = useCallback(
    (items = []) => {
      setMedicacoes(sortMedicacaoHabitualByName(items));
    },
    [setMedicacoes],
  );

  const loadMedicacaoHabitual = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (!selectedUtenteId) {
        setMedicacoes([]);
        setIsLoading(false);
        setIsRefreshing(false);
        setError(null);
        return;
      }

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await getMedicacaoHabitualByUtente(selectedUtenteId);

        setSortedMedicacoes(data);
      } catch (loadError) {
        if (handleAuthError(loadError)) return;

        setError(
          getErrorMessage(
            loadError,
            MEDICACAO_HABITUAL_CONFIG.section.errorTitle,
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleAuthError, selectedUtenteId, setMedicacoes, setSortedMedicacoes],
  );

  const refreshMedicacaoHabitual = useCallback(async () => {
    await loadMedicacaoHabitual({ showRefreshing: true });
  }, [loadMedicacaoHabitual]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialMedicacaoHabitual() {
      await Promise.resolve();

      if (!isMounted) return;

      onResetForUtenteChange();

      if (!selectedUtenteId) {
        setMedicacoes([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getMedicacaoHabitualByUtente(selectedUtenteId);

        if (!isMounted) return;

        setSortedMedicacoes(data);
      } catch (loadError) {
        if (!isMounted) return;
        if (handleAuthError(loadError)) return;

        setError(
          getErrorMessage(
            loadError,
            MEDICACAO_HABITUAL_CONFIG.section.errorTitle,
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialMedicacaoHabitual();

    return () => {
      isMounted = false;
    };
  }, [
    handleAuthError,
    onResetForUtenteChange,
    selectedUtenteId,
    setMedicacoes,
    setSortedMedicacoes,
  ]);

  return {
    isLoading,
    isRefreshing,
    error,
    loadMedicacaoHabitual,
    refreshMedicacaoHabitual,
  };
}
