import { useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { createPedido } from "../api/pedidosApi";

import { deleteExtra, getExtrasByUtente } from "../../extras/api/extrasApi";

import {
  buildPedidoPayload,
  buildRemoveAllMessage,
  buildRemoveMessage,
  clampQuantity,
  isSameMedication,
} from "../utils/santaCasaPedidos.utils";

export function useSantaCasaPedidosActions({
  items,
  hasItems,

  updateItemQuantity,
  removeItemQuantity,
  removeItem,
  removeItemsByKeys,
  clearDraft,

  onPedidoCreated,
}) {
  const { handleAuthError } = useAuth();

  const [returnQuantities, setReturnQuantities] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function deleteCompatibleExtrasFromBackend(receitaItem) {
    const matchingDraftExtras = items.filter((item) => {
      return (
        item.tipo === "EXTRA" &&
        item.utenteId === receitaItem.utenteId &&
        isSameMedication(item, receitaItem)
      );
    });

    let backendExtras;

    try {
      backendExtras = await getExtrasByUtente(receitaItem.utenteId);
    } catch (requestError) {
      if (handleAuthError(requestError)) {
        return {
          removedCount: 0,
          removedLabel: "",
        };
      }

      backendExtras = [];
    }

    const matchingBackendExtras = backendExtras.filter((extra) =>
      isSameMedication(extra, receitaItem),
    );

    const keysToRemove = [
      ...matchingDraftExtras.map((item) => item.key),
      ...matchingBackendExtras.map((extra) => `EXTRA:${extra.id}`),
    ];

    if (keysToRemove.length > 0) {
      removeItemsByKeys(keysToRemove);
    }

    if (matchingBackendExtras.length === 0) {
      return {
        removedCount: matchingDraftExtras.length,
        removedLabel:
          matchingDraftExtras.length === 1
            ? matchingDraftExtras[0].title
            : `${matchingDraftExtras.length} Extras`,
      };
    }

    try {
      await Promise.all(
        matchingBackendExtras.map((extra) =>
          deleteExtra(receitaItem.utenteId, extra.id),
        ),
      );

      return {
        removedCount: matchingBackendExtras.length,
        removedLabel:
          matchingBackendExtras.length === 1
            ? matchingBackendExtras[0].medicamento
            : `${matchingBackendExtras.length} Extras`,
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

      return {
        removedCount: 0,
        removedLabel: "",
      };
    }
  }

  function handleReturnQuantityChange(itemKey, value, max) {
    const quantity = max > 0 ? clampQuantity(value, max) : 0;

    setReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: quantity,
    }));
  }

  async function handleReturnQuantity(itemKey, quantityToReturn) {
    const item = items.find((currentItem) => currentItem.key === itemKey);

    if (!item) return;

    const currentQuantity = Number(item.quantidade) || 0;
    const returnQuantity = clampQuantity(quantityToReturn, currentQuantity);

    removeItemQuantity(itemKey, returnQuantity);

    setReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: 1,
    }));

    let extraInfo = null;

    if (item.tipo === "COM_RECEITA") {
      extraInfo = await deleteCompatibleExtrasFromBackend(item);
    }

    const extraMessage =
      extraInfo?.removedCount > 0
        ? ` ${extraInfo.removedLabel} removido dos Extras em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`
        : "";

    setFeedback({
      type: "success",
      message: `${buildRemoveMessage(item, returnQuantity)}${extraMessage}`,
    });
  }

  async function handleQuantityChange(itemKey, value) {
    const item = items.find((currentItem) => currentItem.key === itemKey);

    if (!item) return;

    const currentQuantity = Number(item.quantidade) || 0;
    const nextQuantity = clampQuantity(value, item.quantidadeRestante);

    updateItemQuantity(itemKey, nextQuantity);

    if (item.tipo === "COM_RECEITA" && nextQuantity < currentQuantity) {
      const extraInfo = await deleteCompatibleExtrasFromBackend(item);

      if (extraInfo.removedCount > 0) {
        setFeedback({
          type: "info",
          message: `${extraInfo.removedLabel} removido dos Extras em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`,
        });
      }
    }
  }

  async function handleRemoveItem(itemKey) {
    const item = items.find((currentItem) => currentItem.key === itemKey);

    if (!item) return;

    removeItem(itemKey);

    setReturnQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: 1,
    }));

    let extraInfo = null;

    if (item.tipo === "COM_RECEITA") {
      extraInfo = await deleteCompatibleExtrasFromBackend(item);
    }

    const extraMessage =
      extraInfo?.removedCount > 0
        ? ` ${extraInfo.removedLabel} removido dos Extras em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para o mesmo medicamento.`
        : "";

    setFeedback({
      type: "success",
      message: `${buildRemoveAllMessage(item)}${extraMessage}`,
    });
  }

  function handleRequestClearDraft() {
    if (!hasItems) return;

    setIsClearDialogOpen(true);
  }

  function handleCancelClearDraft() {
    setIsClearDialogOpen(false);
  }

  function handleConfirmClearDraft() {
    clearDraft();
    setReturnQuantities({});
    setIsClearDialogOpen(false);

    setFeedback({
      type: "success",
      message: "Pedido geral limpo com sucesso.",
    });
  }

  async function handleSubmitPedido(event) {
    event.preventDefault();

    if (!hasItems) {
      setFeedback({
        type: "info",
        message: "Adiciona pelo menos um item ao pedido geral antes de enviar.",
      });

      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createPedido(buildPedidoPayload(items));

      clearDraft();
      setReturnQuantities({});

      setFeedback({
        type: "success",
        message:
          "Pedido geral enviado para a Farmácia com sucesso. A Farmácia pode agora validar ou rejeitar o pedido.",
      });

      await onPedidoCreated?.();
    } catch (requestError) {
      if (handleAuthError(requestError)) return;

      setFeedback({
        type: "error",
        message:
          requestError.message || "Erro ao enviar pedido para a Farmácia.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    returnQuantities,

    isSubmitting,
    isClearDialogOpen,
    feedback,
    setFeedback,

    handleReturnQuantityChange,
    handleReturnQuantity,
    handleQuantityChange,
    handleRemoveItem,

    handleRequestClearDraft,
    handleCancelClearDraft,
    handleConfirmClearDraft,

    handleSubmitPedido,
  };
}
