// src/features/santacasa/pedidos/hooks/useSantaCasaPedidosActions.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { createPedido } from "../api/pedidosApi";
import { getReceitasByUtente } from "../../receitas/api/receitasApi";
import { deleteExtra, getExtrasByUtente } from "../../extras/api/extrasApi";

import { PEDIDOS_PAGE } from "../config/pedidosPage.config";

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

function isReceitaDraftItem(item) {
  return item?.tipo === "COM_RECEITA";
}

function getReceitaDraftItemId(item) {
  return String(item?.id || item?.linhaId || item?.receitaLinhaId || "").trim();
}

function getReceitaDraftItemKey(item) {
  return item?.key || `COM_RECEITA:${getReceitaDraftItemId(item)}`;
}

function getReceitaDraftItemName(item) {
  return (
    item?.title ||
    item?.medicamento ||
    item?.nome ||
    PEDIDOS_PAGE.labels.medicamentoFallback
  );
}

function getSafeQuantity(value) {
  const quantity = Math.floor(Number(value));

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function getUniqueReceitaUtenteIds(items = []) {
  return Array.from(
    new Set(
      items
        .filter(isReceitaDraftItem)
        .map((item) => String(item?.utenteId || "").trim())
        .filter(Boolean),
    ),
  );
}

function buildReceitasMap(receitas = []) {
  const map = new Map();

  receitas.forEach((receita) => {
    const linhaId = String(receita?.linhaId || receita?.id || "").trim();

    if (!linhaId) return;

    map.set(linhaId, receita);
  });

  return map;
}

function isNotFoundError(error) {
  const message = String(error?.message || "")
    .trim()
    .toLowerCase();

  return (
    message.includes("não encontrado") ||
    message.includes("nao encontrado") ||
    message.includes("not found")
  );
}

function isReceitaStillAvailable(item, receitasMap) {
  const linhaId = getReceitaDraftItemId(item);

  if (!linhaId) return false;

  const receita = receitasMap.get(linhaId);

  if (!receita) return false;

  const requestedQuantity = getSafeQuantity(item?.quantidade);
  const availableQuantity = getSafeQuantity(receita?.quantidadeRestante);

  return requestedQuantity > 0 && availableQuantity >= requestedQuantity;
}

function buildRemovedReceitasMessage(items = []) {
  const medicamentos = items.map(getReceitaDraftItemName).filter(Boolean);

  if (medicamentos.length === 0) {
    return PEDIDOS_PAGE.feedback.genericError;
  }

  if (medicamentos.length === 1) {
    return PEDIDOS_PAGE.feedback.expiredReceitaRemoved.replace(
      "{medicamento}",
      medicamentos[0],
    );
  }

  return PEDIDOS_PAGE.feedback.expiredReceitasRemoved
    .replace("{count}", medicamentos.length)
    .replace("{medicamentos}", medicamentos.join(", "));
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

  const lastReceitasSyncSignatureRef = useRef("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const receitasSyncSignature = useMemo(() => {
    return items
      .filter(isReceitaDraftItem)
      .map((item) => {
        return [
          item?.utenteId || "",
          getReceitaDraftItemId(item),
          getSafeQuantity(item?.quantidade),
        ].join(":");
      })
      .sort()
      .join("|");
  }, [items]);

  const syncReceitasDraftWithBackend = useCallback(
    async ({ showFeedback = true } = {}) => {
      const receitaItems = items.filter(isReceitaDraftItem);

      if (receitaItems.length === 0) {
        return {
          removedItems: [],
          hasAuthError: false,
          hasSyncError: false,
        };
      }

      const utenteIds = getUniqueReceitaUtenteIds(receitaItems);
      const receitasByUtenteId = new Map();

      for (const utenteId of utenteIds) {
        try {
          const receitas = await getReceitasByUtente(utenteId);

          receitasByUtenteId.set(utenteId, buildReceitasMap(receitas));
        } catch (requestError) {
          if (handleAuthError(requestError)) {
            return {
              removedItems: [],
              hasAuthError: true,
              hasSyncError: false,
            };
          }

          if (isNotFoundError(requestError)) {
            receitasByUtenteId.set(utenteId, new Map());
            continue;
          }

          if (showFeedback) {
            setFeedback({
              type: "error",
              message: PEDIDOS_PAGE.feedback.draftSyncError,
            });
          }

          return {
            removedItems: [],
            hasAuthError: false,
            hasSyncError: true,
          };
        }
      }

      const unavailableReceitaItems = receitaItems.filter((item) => {
        const utenteId = String(item?.utenteId || "").trim();
        const receitasMap = receitasByUtenteId.get(utenteId) || new Map();

        return !isReceitaStillAvailable(item, receitasMap);
      });

      if (unavailableReceitaItems.length === 0) {
        return {
          removedItems: [],
          hasAuthError: false,
          hasSyncError: false,
        };
      }

      removeItemsByKeys(unavailableReceitaItems.map(getReceitaDraftItemKey));

      if (showFeedback) {
        setFeedback({
          type: "info",
          message: buildRemovedReceitasMessage(unavailableReceitaItems),
        });
      }

      return {
        removedItems: unavailableReceitaItems,
        hasAuthError: false,
        hasSyncError: false,
      };
    },
    [handleAuthError, items, removeItemsByKeys],
  );

  useEffect(() => {
    if (!receitasSyncSignature) {
      lastReceitasSyncSignatureRef.current = "";
      return undefined;
    }

    if (lastReceitasSyncSignatureRef.current === receitasSyncSignature) {
      return undefined;
    }

    lastReceitasSyncSignatureRef.current = receitasSyncSignature;

    const timeoutId = window.setTimeout(() => {
      void syncReceitasDraftWithBackend({ showFeedback: true });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [receitasSyncSignature, syncReceitasDraftWithBackend]);

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
      const syncResult = await syncReceitasDraftWithBackend({
        showFeedback: true,
      });

      if (
        syncResult.hasAuthError ||
        syncResult.hasSyncError ||
        syncResult.removedItems.length > 0
      ) {
        return;
      }

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
