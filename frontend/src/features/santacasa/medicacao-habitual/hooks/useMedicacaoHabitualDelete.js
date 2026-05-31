// src/features/santacasa/medicacao-habitual/hooks/useMedicacaoHabitualDelete.js
import { useCallback, useState } from "react";

import { deleteMedicacaoHabitual as deleteMedicacaoHabitualRequest } from "../api/medicacaoHabitualApi";

import { MEDICACAO_HABITUAL_CONFIG } from "../config/medicacaoHabitual.config";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useMedicacaoHabitualDelete({
  selectedUtenteId,
  setMedicacoes,
  setFeedback,
  handleAuthError,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingMedicacaoId, setDeletingMedicacaoId] = useState(null);

  const resetDeleteState = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const requestDeleteMedicacao = useCallback(
    (medicacao) => {
      setDeleteTarget(medicacao);
      setFeedback(null);
    },
    [setFeedback],
  );

  const cancelDeleteMedicacao = useCallback(() => {
    if (deletingMedicacaoId) return;

    setDeleteTarget(null);
  }, [deletingMedicacaoId]);

  const confirmDeleteMedicacao = useCallback(async () => {
    if (!selectedUtenteId || !deleteTarget?.id) return;

    setDeletingMedicacaoId(deleteTarget.id);
    setFeedback(null);

    try {
      await deleteMedicacaoHabitualRequest(selectedUtenteId, deleteTarget.id);

      setMedicacoes((currentItems) =>
        currentItems.filter((item) => item.id !== deleteTarget.id),
      );

      setFeedback({
        type: "success",
        message: MEDICACAO_HABITUAL_CONFIG.list.deleteSuccessMessage,
      });

      setDeleteTarget(null);
    } catch (deleteError) {
      if (handleAuthError(deleteError)) return;

      setFeedback({
        type: "error",
        message: getErrorMessage(
          deleteError,
          MEDICACAO_HABITUAL_CONFIG.feedback.genericError,
        ),
      });
    } finally {
      setDeletingMedicacaoId(null);
    }
  }, [
    deleteTarget,
    handleAuthError,
    selectedUtenteId,
    setFeedback,
    setMedicacoes,
  ]);

  return {
    deleteTarget,
    isDeleteDialogOpen: Boolean(deleteTarget),
    deletingMedicacaoId,

    requestDeleteMedicacao,
    cancelDeleteMedicacao,
    confirmDeleteMedicacao,

    resetDeleteState,
  };
}
