// src/features/santacasa/operacao/hooks/useSantaCasaOperacaoActions.js
import { useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { useOperacaoCreateActions } from "./useOperacaoCreateActions";
import { useOperacaoDeleteActions } from "./useOperacaoDeleteActions";
import { useOperacaoPedidoActions } from "./useOperacaoPedidoActions";
import { useOperacaoRegularizacaoActions } from "./useOperacaoRegularizacaoActions";

export function useSantaCasaOperacaoActions({
  selectedUtenteId,
  selectedUtente,
  extras,
  pedidoDraftItems,
  addPedidoDraftItem,
  removeItemsByKeys,
  refreshOperationData,
  handleSelectUtente,
}) {
  const { handleAuthError } = useAuth();

  const [feedback, setFeedback] = useState(null);

  const {
    pedidoQuantities,
    resetPedidoQuantities,
    handlePedidoQuantityInputChange,
    handleAddPedidoItem,
    handleBlockedDelete,
  } = useOperacaoPedidoActions({
    selectedUtenteId,
    selectedUtente,
    pedidoDraftItems,
    addPedidoDraftItem,
    setFeedback,
  });

  const {
    regularizacaoConfirmation,
    setRegularizacaoConfirmation,
    regularizacaoDialogData,
    receitaFormResetKey,
    isConfirmingRegularizacao,
    handleCreatedReceitaSuccess,
    handleCancelRegularizacaoConfirmation,
    handleConfirmRegularizacaoConfirmation,
    handleAfterReceitaQuantityBackToList,
    resetRegularizacaoConfirmation,
  } = useOperacaoRegularizacaoActions({
    selectedUtenteId,
    extras,
    removeItemsByKeys,
    refreshOperationData,
    handleAuthError,
    setFeedback,
  });

  const {
    isCreatingReceita,
    isCreatingSemReceita,
    isCreatingExtra,
    handleCreateReceita,
    handleCreateSemReceita,
    handleCreateExtra,
  } = useOperacaoCreateActions({
    selectedUtenteId,
    pedidoDraftItems,
    refreshOperationData,
    handleAuthError,
    setFeedback,
    setRegularizacaoConfirmation,
    handleCreatedReceitaSuccess,
  });

  const {
    deleteTarget,
    deleteDialogData,
    deletingTargetKey,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
  } = useOperacaoDeleteActions({
    selectedUtenteId,
    refreshOperationData,
    removeItemsByKeys,
    handleAuthError,
    setFeedback,
  });

  function handleSelectOperationUtente(utenteId) {
    resetPedidoQuantities();
    resetRegularizacaoConfirmation();
    setFeedback(null);
    handleSelectUtente(utenteId);
  }

  return {
    pedidoQuantities,
    deleteTarget,
    deleteDialogData,
    deletingTargetKey,

    regularizacaoConfirmation,
    regularizacaoDialogData,
    receitaFormResetKey,

    isCreatingReceita,
    isConfirmingRegularizacao,
    isCreatingSemReceita,
    isCreatingExtra,

    feedback,
    setFeedback,

    handleSelectOperationUtente,
    handlePedidoQuantityInputChange,

    handleCreateReceita,
    handleCreateSemReceita,
    handleCreateExtra,

    handleCancelRegularizacaoConfirmation,
    handleConfirmRegularizacaoConfirmation,

    handleAddPedidoItem,
    handleBlockedDelete,

    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,

    handleAfterReceitaQuantityBackToList,
  };
}
