import { useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  createReceita,
  deleteReceitaLinha,
} from "../../receitas/api/receitasApi";

import {
  createSemReceita,
  deleteSemReceita,
} from "../../sem-receita/api/semReceitaApi";

import { createExtra, deleteExtra } from "../../extras/api/extrasApi";

import { SEM_RECEITA_PAGE } from "../../sem-receita/config/semReceitaPage.config";
import { EXTRAS_PAGE } from "../../extras/config/extrasPage.config";

import { clampQuantity } from "../../pedidos/utils/pedidoItems";

import {
  buildAddToPedidoMessage,
  buildGlobalDraftItem,
  buildReceitaDraftItems,
  buildReceitaSuccessMessage,
  formatUnitsLabel,
  getDeleteDialogData,
  getDeleteSuccessMessage,
  getDeleteTargetKey,
  getItemMedicationName,
  getPedidoKeyFromDeleteTarget,
  getReceitaFieldErrors,
  getResolvedExtraKeys,
  isSameMedication,
} from "../utils/santaCasaOperacao.utils";

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

  const [pedidoQuantities, setPedidoQuantities] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingTargetKey, setDeletingTargetKey] = useState(null);

  const [isCreatingReceita, setIsCreatingReceita] = useState(false);
  const [isCreatingSemReceita, setIsCreatingSemReceita] = useState(false);
  const [isCreatingExtra, setIsCreatingExtra] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const deleteDialogData = getDeleteDialogData(deleteTarget);

  async function deleteCompatibleExtrasFromBackend(receitaItem) {
    if (!selectedUtenteId) {
      return {
        removedCount: 0,
        removedLabel: "",
      };
    }

    const matchingExtras = extras.filter((extra) =>
      isSameMedication(extra, receitaItem),
    );

    if (matchingExtras.length === 0) {
      return {
        removedCount: 0,
        removedLabel: "",
      };
    }

    const matchingExtraKeys = matchingExtras.map(
      (extra) => `EXTRA:${extra.id}`,
    );

    removeItemsByKeys(matchingExtraKeys);

    const removedLabel =
      matchingExtras.length === 1
        ? matchingExtras[0].medicamento
        : `${matchingExtras.length} Extras`;

    try {
      await Promise.all(
        matchingExtras.map((extra) => deleteExtra(selectedUtenteId, extra.id)),
      );

      await refreshOperationData();

      return {
        removedCount: matchingExtras.length,
        removedLabel,
      };
    } catch (requestError) {
      if (handleAuthError(requestError)) {
        return {
          removedCount: 0,
          removedLabel: "",
        };
      }

      setFeedback({
        type: "error",
        message:
          requestError.message ||
          "Erro ao remover Extra incompatível com a receita disponível.",
      });

      await refreshOperationData();

      return {
        removedCount: 0,
        removedLabel: "",
      };
    }
  }

  function handleSelectOperationUtente(utenteId) {
    setPedidoQuantities({});
    setFeedback(null);
    handleSelectUtente(utenteId);
  }

  function handlePedidoQuantityInputChange(itemKey, value, max) {
    const nextQuantity = max > 0 ? clampQuantity(value, max) : 0;

    setPedidoQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: nextQuantity,
    }));
  }

  async function handleCreateReceita(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreatingReceita(true);
    setFeedback(null);

    try {
      const createdReceita = await createReceita(selectedUtenteId, payload);

      const extrasResolvidos = Array.isArray(createdReceita?.extrasResolvidos)
        ? createdReceita.extrasResolvidos
        : [];

      const extraKeysToRemove = getResolvedExtraKeys(extrasResolvidos);

      if (extraKeysToRemove.length > 0) {
        removeItemsByKeys(extraKeysToRemove);
      }

      await refreshOperationData();

      setFeedback({
        type: "success",
        message: buildReceitaSuccessMessage(createdReceita, extrasResolvidos),
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

      const message = requestError.message || "Erro ao criar receita.";

      setFeedback({
        type: "error",
        message,
      });

      return {
        ok: false,
        fieldErrors: getReceitaFieldErrors(requestError),
      };
    } finally {
      setIsCreatingReceita(false);
    }
  }

  async function handleCreateSemReceita(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreatingSemReceita(true);
    setFeedback(null);

    try {
      await createSemReceita(selectedUtenteId, payload);
      await refreshOperationData();

      setFeedback({
        type: "success",
        message: SEM_RECEITA_PAGE.form.successMessage,
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
        message:
          requestError.message || "Erro ao criar medicamento sem receita.",
      });

      return {
        ok: false,
        fieldErrors: {},
      };
    } finally {
      setIsCreatingSemReceita(false);
    }
  }

  async function handleCreateExtra(payload) {
    if (!selectedUtenteId) {
      return {
        ok: false,
        fieldErrors: {},
      };
    }

    setIsCreatingExtra(true);
    setFeedback(null);

    try {
      await createExtra(selectedUtenteId, {
        ...payload,
        receitaDraftItems: buildReceitaDraftItems(
          pedidoDraftItems,
          selectedUtenteId,
        ),
      });

      await refreshOperationData();

      setFeedback({
        type: "success",
        message: EXTRAS_PAGE.form.successMessage,
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
        message: requestError.message || "Erro ao criar Extra.",
      });

      return {
        ok: false,
        fieldErrors: {},
      };
    } finally {
      setIsCreatingExtra(false);
    }
  }

  function handleAddPedidoItem(item) {
    if (!selectedUtenteId) return;

    const maxAvailable = Number(item.quantidadeRestante) || 0;

    const existingItem = pedidoDraftItems.find(
      (currentItem) => currentItem.key === item.key,
    );

    const currentQuantityInPedido = Number(existingItem?.quantidade) || 0;
    const availableToAdd = Math.max(0, maxAvailable - currentQuantityInPedido);

    if (availableToAdd <= 0) {
      setFeedback({
        type: "info",
        message: `${getItemMedicationName(
          item,
        )} já está totalmente no pedido geral.`,
      });

      return;
    }

    const quantityToAdd = clampQuantity(item.quantidade, availableToAdd);
    const nextQuantityInPedido = Math.min(
      currentQuantityInPedido + quantityToAdd,
      maxAvailable,
    );
    const remainingQuantity = Math.max(0, maxAvailable - nextQuantityInPedido);

    addPedidoDraftItem(
      buildGlobalDraftItem({
        item: {
          ...item,
          quantidade: quantityToAdd,
        },
        selectedUtente,
        selectedUtenteId,
      }),
    );

    setPedidoQuantities((currentQuantities) => ({
      ...currentQuantities,
      [item.key]: 1,
    }));

    setFeedback({
      type: "success",
      message: buildAddToPedidoMessage({
        item,
        addedQuantity: quantityToAdd,
        remainingQuantity,
        utenteNome: selectedUtente?.nome || "utente selecionado",
      }),
    });
  }

  function handleBlockedDelete(item, quantidadeEmPedido) {
    const medicamento = getItemMedicationName(item);
    const quantityLabel = formatUnitsLabel(quantidadeEmPedido);

    setFeedback({
      type: "info",
      message: `Não é possível remover ${medicamento} porque ainda existem ${quantityLabel} no pedido geral. Retira primeiro essa quantidade na página Pedidos.`,
    });
  }

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

  async function handleAfterReceitaQuantityBackToList(receitaItem) {
    const extraInfo = await deleteCompatibleExtrasFromBackend(receitaItem);

    if (extraInfo.removedCount > 0) {
      setFeedback({
        type: "info",
        message: `${extraInfo.removedLabel} removido dos Extras em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`,
      });
    }
  }

  return {
    pedidoQuantities,
    deleteTarget,
    deleteDialogData,
    deletingTargetKey,

    isCreatingReceita,
    isCreatingSemReceita,
    isCreatingExtra,

    feedback,
    setFeedback,

    handleSelectOperationUtente,
    handlePedidoQuantityInputChange,

    handleCreateReceita,
    handleCreateSemReceita,
    handleCreateExtra,

    handleAddPedidoItem,
    handleBlockedDelete,

    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,

    handleAfterReceitaQuantityBackToList,
  };
}
