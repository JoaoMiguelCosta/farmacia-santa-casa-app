// src/features/santacasa/pedidos/hooks/usePedidoDraftState.js
import { useCallback, useMemo, useState } from "react";

import {
  clearPedidoDraftItems,
  readPedidoDraftItems,
  writePedidoDraftItems,
} from "../state/pedidoDraft.storage";

function clampQuantity(value, max) {
  const quantity = Math.floor(Number(value));
  const maxQuantity = Math.floor(Number(max));

  if (!Number.isFinite(maxQuantity) || maxQuantity <= 0) return 0;
  if (!Number.isFinite(quantity) || quantity <= 0) return 1;

  return Math.min(quantity, maxQuantity);
}

function getStringValue(...values) {
  const value = values.find((currentValue) => {
    return String(currentValue || "").trim().length > 0;
  });

  return String(value || "").trim();
}

function extractReceitaNumber(description) {
  const match = String(description || "").match(/receita\s+([0-9]+)/i);

  return match?.[1] || "";
}

function extractPinAcesso(meta) {
  const match = String(meta || "").match(/pin\s+([0-9]+)/i);

  return match?.[1] || "";
}

function extractPinOpcao(meta) {
  const match = String(meta || "").match(/opção\s+([0-9]+)/i);

  return match?.[1] || "";
}

function normalizeDraftItem(item) {
  const quantidadeRestante = Math.floor(Number(item?.quantidadeRestante));
  const quantidade = clampQuantity(item?.quantidade, quantidadeRestante);

  return {
    key: item.key,
    utenteId: item.utenteId,
    utenteNome: item.utenteNome,
    utenteNumero9: item.utenteNumero9,

    tipo: item.tipo,
    id: item.id,

    title: item.title,
    description: item.description,
    meta: item.meta,

    numero19: getStringValue(
      item.numero19,
      item.source?.numero19,
      item.source?.receita?.numero19,
      extractReceitaNumber(item.description),
    ),

    pinAcesso6: getStringValue(
      item.pinAcesso6,
      item.source?.pinAcesso6,
      item.source?.receita?.pinAcesso6,
      extractPinAcesso(item.meta),
    ),

    pinOpcao4: getStringValue(
      item.pinOpcao4,
      item.source?.pinOpcao4,
      item.source?.receita?.pinOpcao4,
      extractPinOpcao(item.meta),
    ),

    validade: getStringValue(
      item.validade,
      item.source?.validade,
      item.source?.receitaLinha?.validade,
      item.source?.receita?.validade,
    ),

    quantidade,
    quantidadeRestante,
  };
}

function sortDraftItems(items = []) {
  const collator = new Intl.Collator("pt-PT", {
    sensitivity: "base",
    numeric: true,
  });

  return [...items].sort((a, b) => {
    const utenteCompare = collator.compare(
      a.utenteNome || "",
      b.utenteNome || "",
    );

    if (utenteCompare !== 0) return utenteCompare;

    const tipoCompare = collator.compare(a.tipo || "", b.tipo || "");

    if (tipoCompare !== 0) return tipoCompare;

    return collator.compare(a.title || "", b.title || "");
  });
}

function persistItems(items = []) {
  const sortedItems = sortDraftItems(items);
  writePedidoDraftItems(sortedItems);

  return sortedItems;
}

export function usePedidoDraftState() {
  const [items, setItems] = useState(() => readPedidoDraftItems());

  const updateItems = useCallback((updater) => {
    setItems((currentItems) => {
      const nextItems =
        typeof updater === "function" ? updater(currentItems) : updater;

      return persistItems(nextItems);
    });
  }, []);

  const addItem = useCallback(
    (item) => {
      const nextItem = normalizeDraftItem(item);

      if (
        !nextItem.key ||
        !nextItem.utenteId ||
        !nextItem.tipo ||
        !nextItem.id ||
        nextItem.quantidade <= 0
      ) {
        return;
      }

      updateItems((currentItems) => {
        const alreadyExists = currentItems.some(
          (currentItem) => currentItem.key === nextItem.key,
        );

        if (!alreadyExists) {
          return [...currentItems, nextItem];
        }

        return currentItems.map((currentItem) => {
          if (currentItem.key !== nextItem.key) return currentItem;

          return {
            ...currentItem,

            numero19: currentItem.numero19 || nextItem.numero19,
            pinAcesso6: currentItem.pinAcesso6 || nextItem.pinAcesso6,
            pinOpcao4: currentItem.pinOpcao4 || nextItem.pinOpcao4,
            validade: currentItem.validade || nextItem.validade,

            quantidade: clampQuantity(
              Number(currentItem.quantidade) + Number(nextItem.quantidade),
              currentItem.quantidadeRestante,
            ),
          };
        });
      });
    },
    [updateItems],
  );

  const removeItem = useCallback(
    (itemKey) => {
      updateItems((currentItems) =>
        currentItems.filter((item) => item.key !== itemKey),
      );
    },
    [updateItems],
  );

  const removeItemsByKeys = useCallback(
    (itemKeys = []) => {
      const keys = new Set(itemKeys);

      updateItems((currentItems) =>
        currentItems.filter((item) => !keys.has(item.key)),
      );
    },
    [updateItems],
  );

  const clearDraft = useCallback(() => {
    setItems([]);
    clearPedidoDraftItems();
  }, []);

  return useMemo(
    () => ({
      items,
      count: items.length,
      hasItems: items.length > 0,

      addItem,
      removeItem,
      removeItemsByKeys,
      clearDraft,
    }),
    [items, addItem, removeItem, removeItemsByKeys, clearDraft],
  );
}
