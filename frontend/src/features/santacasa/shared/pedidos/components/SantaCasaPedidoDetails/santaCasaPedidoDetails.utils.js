// src/features/santacasa/shared/pedidos/components/SantaCasaPedidoDetails/santaCasaPedidoDetails.utils.js

import { SANTACASA_PEDIDO_DETAILS } from "../../config/santaCasaPedidoDetails.config";

import { SANTACASA_PEDIDO_UI } from "../../config/santaCasaPedidoUi.config";

import {
  getSantaCasaPedidoItemMedicationLabel,
  getSantaCasaPedidoItemQuantity,
  getSantaCasaPedidoItemReceita,
  getSantaCasaPedidoItems,
  getSantaCasaPedidoItemStatusLabel,
  getSantaCasaPedidoItemTypeLabel,
  getSantaCasaPedidoReceitaBarcodeCodes,
  getSantaCasaPedidoReceitaValidityLabel,
  groupSantaCasaPedidoItemsByUtente,
  hasSantaCasaPedidoReceitaBarcodeData,
} from "../../utils/santaCasaPedido.utils";

import {
  compareSantaCasaPedidoOperationalItems,
  isSantaCasaPedidoItemCanceledByExpiration,
} from "../../utils/santaCasaPedidoOperational.utils";

function normalizeDataValue(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function getGroupTotalQuantity(items = []) {
  return items.reduce((total, item) => {
    return total + getSantaCasaPedidoItemQuantity(item);
  }, 0);
}

function getPedidoGroups(pedido) {
  const groups = groupSantaCasaPedidoItemsByUtente(
    getSantaCasaPedidoItems(pedido),
    {
      sortItems: compareSantaCasaPedidoOperationalItems,

      utenteFallback: SANTACASA_PEDIDO_UI.labels.utenteFallback,

      emptyValue: SANTACASA_PEDIDO_UI.labels.emptyValue,
    },
  );

  return groups.map((group) => {
    const items = Array.isArray(group.items) ? group.items : [];

    return {
      key: String(group.utenteId || group.utenteNumero9 || group.utenteNome),

      utente: {
        id: group.utenteId,

        nome: group.utenteNome || SANTACASA_PEDIDO_UI.labels.utenteFallback,

        numero9: group.utenteNumero9 || SANTACASA_PEDIDO_UI.labels.emptyValue,
      },

      items,
      itemsCount: items.length,

      totalQuantity: getGroupTotalQuantity(items),
    };
  });
}

export function getSantaCasaPedidoDetailsViewModel(pedido) {
  const groups = getPedidoGroups(pedido);

  return {
    hasGroups: groups.length > 0,
    groups,
  };
}

export function getSantaCasaPedidoItemViewModel(
  item,
  { variant = "pending" } = {},
) {
  const { labels, itemWarnings } = SANTACASA_PEDIDO_DETAILS;

  const itemType = normalizeDataValue(item?.tipo);

  const itemStatus = normalizeDataValue(item?.status);

  const receita = getSantaCasaPedidoItemReceita(item);

  const isComReceita = itemType === "COM_RECEITA";

  const isCanceledByExpiration =
    isSantaCasaPedidoItemCanceledByExpiration(item);

  const hasBarcodeData = hasSantaCasaPedidoReceitaBarcodeData(receita);

  const barcodeCodes =
    isComReceita && hasBarcodeData
      ? getSantaCasaPedidoReceitaBarcodeCodes(receita, {
          receitaNumberLabel: labels.receitaNumber,

          pinAcessoLabel: labels.pinAcesso,

          pinOpcaoLabel: labels.pinOpcao,
        })
      : [];

  return {
    itemType,
    itemStatus,

    isComReceita,
    isCanceledByExpiration,

    typeLabel: getSantaCasaPedidoItemTypeLabel(itemType),

    statusLabel: getSantaCasaPedidoItemStatusLabel(itemStatus),

    medicamentoLabel: getSantaCasaPedidoItemMedicationLabel(item),

    quantidade: getSantaCasaPedidoItemQuantity(item),

    validadeLabel:
      getSantaCasaPedidoReceitaValidityLabel(receita) || labels.emptyValue,

    barcodeCodes,

    canExpand: isComReceita && barcodeCodes.length > 0,

    expiredWarning:
      variant === "history"
        ? itemWarnings.expired.history
        : itemWarnings.expired.pending,
  };
}
