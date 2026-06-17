// src/features/santacasa/medicacao-habitual/hooks/useMedicacaoHabitual.js
import { useCallback, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { buildMedicacaoHabitualOptions } from "../utils/medicacaoHabitual.utils";

import { useMedicacaoHabitualClear } from "./useMedicacaoHabitualClear";
import { useMedicacaoHabitualCreate } from "./useMedicacaoHabitualCreate";
import { useMedicacaoHabitualDelete } from "./useMedicacaoHabitualDelete";
import { useMedicacaoHabitualLoader } from "./useMedicacaoHabitualLoader";

export function useMedicacaoHabitual({ selectedUtenteId } = {}) {
  const { handleAuthError } = useAuth();

  const [medicacoes, setMedicacoes] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const hasMedicacoes = medicacoes.length > 0;

  const options = useMemo(() => {
    return buildMedicacaoHabitualOptions(medicacoes);
  }, [medicacoes]);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const createController = useMedicacaoHabitualCreate({
    selectedUtenteId,
    medicacoes,
    setMedicacoes,
    setFeedback,
    handleAuthError,
  });

  const deleteController = useMedicacaoHabitualDelete({
    selectedUtenteId,
    setMedicacoes,
    setFeedback,
    handleAuthError,
  });

  const clearController = useMedicacaoHabitualClear({
    selectedUtenteId,
    hasMedicacoes,
    setMedicacoes,
    setFeedback,
    handleAuthError,
  });

  const {
    medicamentoInput,
    inputError,
    isCreating,
    updateMedicamentoInput,
    handleSubmit,
    createMedicacaoHabitualItem,
    resetCreateState,
  } = createController;

  const {
    deleteTarget,
    isDeleteDialogOpen,
    deletingMedicacaoId,
    requestDeleteMedicacao,
    cancelDeleteMedicacao,
    confirmDeleteMedicacao,
    resetDeleteState,
  } = deleteController;

  const {
    isClearDialogOpen,
    isClearing,
    requestClearMedicacao,
    cancelClearMedicacao,
    confirmClearMedicacao,
    resetClearState,
  } = clearController;

  const resetStateForUtenteChange = useCallback(() => {
    resetCreateState();
    resetDeleteState();
    resetClearState();
    setFeedback(null);
  }, [resetCreateState, resetDeleteState, resetClearState]);

  const loaderController = useMedicacaoHabitualLoader({
    selectedUtenteId,
    setMedicacoes,
    handleAuthError,
    onResetForUtenteChange: resetStateForUtenteChange,
  });

  const isBusy = Boolean(isCreating || isClearing || deletingMedicacaoId);

  return {
    medicacoes,
    options,
    hasMedicacoes,

    medicamentoInput,
    inputError,

    deleteTarget,
    isDeleteDialogOpen,
    isClearDialogOpen,

    isLoading: loaderController.isLoading,
    isRefreshing: loaderController.isRefreshing,
    isCreating,
    isClearing,
    deletingMedicacaoId,
    isBusy,

    error: loaderController.error,
    feedback,
    setFeedback,

    loadMedicacaoHabitual: loaderController.loadMedicacaoHabitual,
    refreshMedicacaoHabitual: loaderController.refreshMedicacaoHabitual,

    updateMedicamentoInput,
    handleSubmit,
    createMedicacaoHabitualItem,

    requestDeleteMedicacao,
    cancelDeleteMedicacao,
    confirmDeleteMedicacao,

    requestClearMedicacao,
    cancelClearMedicacao,
    confirmClearMedicacao,

    clearFeedback,
  };
}
