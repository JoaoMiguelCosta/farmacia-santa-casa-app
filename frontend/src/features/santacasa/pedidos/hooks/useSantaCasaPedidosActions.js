// src/features/santacasa/pedidos/hooks/useSantaCasaPedidosActions.js
import { useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { createPedido } from "../api/pedidosApi";

import { deleteExtra, getExtrasByUtente } from "../../extras/api/extrasApi";

import {
  buildPedidoPayload,
  buildRemoveAllMessage,
  isSameMedication,
} from "../utils/santaCasaPedidos.utils";

function buildRemovedVendasSuspensasMessage(extraInfo) {
  if (!extraInfo?.removedCount) return "";

  const removedVerb = extraInfo.removedCount === 1 ? "removido" : "removidas";

  const sameMedicationLabel =
    extraInfo.removedCount === 1
      ? "o mesmo medicamento"
      : "os mesmos medicamentos";

  return ` ${extraInfo.removedLabel} ${removedVerb} das vendas suspensas em aberto e do pedido geral, porque voltou a existir quantidade disponível com receita para ${sameMedicationLabel}.`;
}

export function useSantaCasaPedidosActions({
  items,
  hasItems,

  removeItem,
  removeItemsByKeys,
  clearDraft,

  onPedidoCreated,
}) {
  const { handleAuthError } = useAuth();

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
            : `${matchingDraftExtras.length} vendas suspensas`,
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
            : `${matchingBackendExtras.length} vendas suspensas`,
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
          "Erro ao remover Venda Suspensa incompatível com a receita disponível.",
      });

      return {
        removedCount: 0,
        removedLabel: "",
      };
    }
  }

  async function handleRemoveItem(itemKey) {
    const item = items.find((currentItem) => currentItem.key === itemKey);

    if (!item) return;

    removeItem(itemKey);

    let extraInfo = null;

    if (item.tipo === "COM_RECEITA") {
      extraInfo = await deleteCompatibleExtrasFromBackend(item);
    }

    const extraMessage = buildRemovedVendasSuspensasMessage(extraInfo);

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
        message:
          "Adiciona pelo menos um medicamento ao pedido geral antes de enviar.",
      });

      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createPedido(buildPedidoPayload(items));

      clearDraft();

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
    isSubmitting,
    isClearDialogOpen,
    feedback,
    setFeedback,

    handleRemoveItem,

    handleRequestClearDraft,
    handleCancelClearDraft,
    handleConfirmClearDraft,

    handleSubmitPedido,
  };
}
