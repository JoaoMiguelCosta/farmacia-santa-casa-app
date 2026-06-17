// src/features/santacasa/medicacao-habitual/hooks/useMedicacaoHabitualClear.js
import { useCallback, useState } from "react";

import { clearMedicacaoHabitual as clearMedicacaoHabitualRequest } from "../api/medicacaoHabitualApi";

import { MEDICACAO_HABITUAL_CONFIG } from "../config/medicacaoHabitual.config";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useMedicacaoHabitualClear({
  selectedUtenteId,
  hasMedicacoes,
  setMedicacoes,
  setFeedback,
  handleAuthError,
}) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const resetClearState = useCallback(() => {
    setIsClearDialogOpen(false);
  }, []);

  const requestClearMedicacao = useCallback(() => {
    if (!hasMedicacoes) return;

    setIsClearDialogOpen(true);
    setFeedback(null);
  }, [hasMedicacoes, setFeedback]);

  const cancelClearMedicacao = useCallback(() => {
    if (isClearing) return;

    setIsClearDialogOpen(false);
  }, [isClearing]);

  const confirmClearMedicacao = useCallback(async () => {
    if (!selectedUtenteId) return;

    setIsClearing(true);
    setFeedback(null);

    try {
      await clearMedicacaoHabitualRequest(selectedUtenteId);

      setMedicacoes([]);
      setIsClearDialogOpen(false);

      setFeedback({
        type: "success",
        message: MEDICACAO_HABITUAL_CONFIG.list.clearSuccessMessage,
      });
    } catch (clearError) {
      if (handleAuthError(clearError)) return;

      setFeedback({
        type: "error",
        message: getErrorMessage(
          clearError,
          MEDICACAO_HABITUAL_CONFIG.feedback.genericError,
        ),
      });
    } finally {
      setIsClearing(false);
    }
  }, [handleAuthError, selectedUtenteId, setFeedback, setMedicacoes]);

  return {
    isClearDialogOpen,
    isClearing,

    requestClearMedicacao,
    cancelClearMedicacao,
    confirmClearMedicacao,

    resetClearState,
  };
}
