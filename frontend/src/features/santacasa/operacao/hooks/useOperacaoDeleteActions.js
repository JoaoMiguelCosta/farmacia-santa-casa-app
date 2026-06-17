// src/features/santacasa/operacao/hooks/useOperacaoDeleteActions.js
import { useState } from "react";

import { deleteReceitaLinha } from "../../receitas/api/receitasApi";
import { deleteSemReceita } from "../../semReceita/api/semReceitaApi";
import { deleteExtra } from "../../extras/api/extrasApi";

import {
  getDeleteDialogData,
  getDeleteSuccessMessage,
  getDeleteTargetKey,
  getPedidoKeyFromDeleteTarget,
} from "../utils/santaCasaOperacao.utils";

export function useOperacaoDeleteActions({
  selectedUtenteId,
  refreshOperationData,
  removeItemsByKeys,
  handleAuthError,
  setFeedback,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingTargetKey, setDeletingTargetKey] = useState(null);

  const deleteDialogData = getDeleteDialogData(deleteTarget);

  function handleRequestDelete(kind, item) {
    setDeleteTarget({
      kind,
      item,
    });

    setFeedback(null);
  }

  function handleCancelDelete() {
    if (deletingTargetKey) return;

    setDeleteTarget(null);
  }

  async function handleConfirmDelete() {
    if (!selectedUtenteId || !deleteTarget) return;

    const targetKey = getDeleteTargetKey(deleteTarget);

    setDeletingTargetKey(targetKey);
    setFeedback(null);

    try {
      if (deleteTarget.kind === "receita") {
        await deleteReceitaLinha(selectedUtenteId, deleteTarget.item.linhaId);
      }

      if (deleteTarget.kind === "semReceita") {
        await deleteSemReceita(selectedUtenteId, deleteTarget.item.id);
      }

      if (deleteTarget.kind === "extra") {
        await deleteExtra(selectedUtenteId, deleteTarget.item.id);
      }

      const pedidoKey = getPedidoKeyFromDeleteTarget(deleteTarget);

      removeItemsByKeys([pedidoKey]);

      await refreshOperationData();

      setFeedback({
        type: "success",
        message: getDeleteSuccessMessage(deleteTarget),
      });

      setDeleteTarget(null);
    } catch (requestError) {
      if (handleAuthError(requestError)) return;

      setFeedback({
        type: "error",
        message: requestError.message || "Erro ao remover item.",
      });
    } finally {
      setDeletingTargetKey(null);
    }
  }

  return {
    deleteTarget,
    deleteDialogData,
    deletingTargetKey,

    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
  };
}
