// src/features/santacasa/operacao/hooks/useOperacaoPedidoActions.js
import { useState } from "react";

import { clampQuantity } from "../../pedidos/utils/pedidoItems";

import {
  buildAddToPedidoMessage,
  buildGlobalDraftItem,
  formatUnitsLabel,
  getItemMedicationName,
} from "../utils/santaCasaOperacao.utils";

export function useOperacaoPedidoActions({
  selectedUtenteId,
  selectedUtente,
  pedidoDraftItems,
  addPedidoDraftItem,
  setFeedback,
}) {
  const [pedidoQuantities, setPedidoQuantities] = useState({});

  function resetPedidoQuantities() {
    setPedidoQuantities({});
  }

  function handlePedidoQuantityInputChange(itemKey, value, max) {
    const nextQuantity = max > 0 ? clampQuantity(value, max) : 0;

    setPedidoQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: nextQuantity,
    }));
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

  return {
    pedidoQuantities,
    resetPedidoQuantities,

    handlePedidoQuantityInputChange,
    handleAddPedidoItem,
    handleBlockedDelete,
  };
}
