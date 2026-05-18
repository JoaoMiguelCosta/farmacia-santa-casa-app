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

  const updateItemQuantity = useCallback(
    (itemKey, quantity) => {
      updateItems((currentItems) =>
        currentItems
          .map((item) => {
            if (item.key !== itemKey) return item;

            const nextQuantity = clampQuantity(
              quantity,
              item.quantidadeRestante,
            );

            if (nextQuantity <= 0) return null;

            return {
              ...item,
              quantidade: nextQuantity,
            };
          })
          .filter(Boolean),
      );
    },
    [updateItems],
  );

  const removeItemQuantity = useCallback(
    (itemKey, quantityToRemove) => {
      updateItems((currentItems) =>
        currentItems
          .map((item) => {
            if (item.key !== itemKey) return item;

            const removeQuantity = clampQuantity(
              quantityToRemove,
              item.quantidade,
            );

            const nextQuantity = Number(item.quantidade) - removeQuantity;

            if (nextQuantity <= 0) return null;

            return {
              ...item,
              quantidade: nextQuantity,
            };
          })
          .filter(Boolean),
      );
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
      updateItemQuantity,
      removeItemQuantity,
      removeItem,
      removeItemsByKeys,
      clearDraft,
    }),
    [
      items,
      addItem,
      updateItemQuantity,
      removeItemQuantity,
      removeItem,
      removeItemsByKeys,
      clearDraft,
    ],
  );
}
