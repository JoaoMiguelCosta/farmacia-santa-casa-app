// src/features/santacasa/shared/pedidos/utils/santaCasaPedidoOperational.utils.js

import {
  SANTACASA_PEDIDO_ITEM_STATUS,
  SANTACASA_PEDIDO_STATUS,
  SANTACASA_PEDIDO_VISUAL_STATUS,
} from "../config/santaCasaPedidoUi.config";

import {
  getSantaCasaPedidoItemMedicationLabel,
  getSantaCasaPedidoItemQuantity,
  getSantaCasaPedidoItems,
} from "./santaCasaPedido.utils";

const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

function getNormalizedStatus(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function getItemStatusSortWeight(status) {
  const normalizedStatus = getNormalizedStatus(status);

  if (normalizedStatus === SANTACASA_PEDIDO_ITEM_STATUS.pending) {
    return 1;
  }

  if (normalizedStatus === SANTACASA_PEDIDO_ITEM_STATUS.validated) {
    return 2;
  }

  if (normalizedStatus === SANTACASA_PEDIDO_ITEM_STATUS.rejected) {
    return 3;
  }

  if (normalizedStatus === SANTACASA_PEDIDO_ITEM_STATUS.canceledByExpiration) {
    return 4;
  }

  if (normalizedStatus === SANTACASA_PEDIDO_ITEM_STATUS.canceled) {
    return 5;
  }

  return 9;
}

function getItemsByStatuses(pedido, statuses) {
  const allowedStatuses = new Set(statuses);

  return getSantaCasaPedidoItems(pedido).filter((item) => {
    return allowedStatuses.has(getNormalizedStatus(item?.status));
  });
}

function getItemsQuantity(items = []) {
  return items.reduce((total, item) => {
    return total + getSantaCasaPedidoItemQuantity(item);
  }, 0);
}

function getPedidoClosedReason(pedido) {
  return String(
    pedido?.closedReason || pedido?.cancelReason || pedido?.reason || "",
  )
    .trim()
    .toLocaleLowerCase("pt-PT");
}

export function isSantaCasaPedidoItemPending(item) {
  return (
    getNormalizedStatus(item?.status) === SANTACASA_PEDIDO_ITEM_STATUS.pending
  );
}

export function isSantaCasaPedidoItemValidated(item) {
  return (
    getNormalizedStatus(item?.status) === SANTACASA_PEDIDO_ITEM_STATUS.validated
  );
}

export function isSantaCasaPedidoItemRejected(item) {
  return (
    getNormalizedStatus(item?.status) === SANTACASA_PEDIDO_ITEM_STATUS.rejected
  );
}

export function isSantaCasaPedidoItemCanceled(item) {
  return (
    getNormalizedStatus(item?.status) === SANTACASA_PEDIDO_ITEM_STATUS.canceled
  );
}

export function isSantaCasaPedidoItemCanceledByExpiration(item) {
  return (
    getNormalizedStatus(item?.status) ===
    SANTACASA_PEDIDO_ITEM_STATUS.canceledByExpiration
  );
}

export function getSantaCasaPedidoPendingItems(pedido) {
  return getItemsByStatuses(pedido, [SANTACASA_PEDIDO_ITEM_STATUS.pending]);
}

export function getSantaCasaPedidoValidatedItems(pedido) {
  return getItemsByStatuses(pedido, [SANTACASA_PEDIDO_ITEM_STATUS.validated]);
}

export function getSantaCasaPedidoRejectedItems(pedido) {
  return getItemsByStatuses(pedido, [SANTACASA_PEDIDO_ITEM_STATUS.rejected]);
}

export function getSantaCasaPedidoCanceledItems(pedido) {
  return getItemsByStatuses(pedido, [SANTACASA_PEDIDO_ITEM_STATUS.canceled]);
}

export function getSantaCasaPedidoExpiredItems(pedido) {
  return getItemsByStatuses(pedido, [
    SANTACASA_PEDIDO_ITEM_STATUS.canceledByExpiration,
  ]);
}

export function hasSantaCasaPedidoExpiredItems(pedido) {
  return getSantaCasaPedidoExpiredItems(pedido).length > 0;
}

export function isSantaCasaPedidoCanceled(pedido) {
  return (
    getNormalizedStatus(pedido?.status) === SANTACASA_PEDIDO_STATUS.canceled
  );
}

export function isSantaCasaPedidoCanceledByExpiration(pedido) {
  if (!isSantaCasaPedidoCanceled(pedido)) {
    return false;
  }

  const reason = getPedidoClosedReason(pedido);

  if (reason.includes("expiração") || reason.includes("expiracao")) {
    return true;
  }

  return hasSantaCasaPedidoExpiredItems(pedido);
}

export function getSantaCasaPedidoVisualStatus(pedido) {
  const status = getNormalizedStatus(pedido?.status);
  const hasExpiredItems = hasSantaCasaPedidoExpiredItems(pedido);

  if (status === SANTACASA_PEDIDO_STATUS.pending && hasExpiredItems) {
    return SANTACASA_PEDIDO_VISUAL_STATUS.pendingWithWarnings;
  }

  if (status === SANTACASA_PEDIDO_STATUS.validated && hasExpiredItems) {
    return SANTACASA_PEDIDO_VISUAL_STATUS.validatedWithWarnings;
  }

  if (
    status === SANTACASA_PEDIDO_STATUS.canceled &&
    isSantaCasaPedidoCanceledByExpiration(pedido)
  ) {
    return SANTACASA_PEDIDO_VISUAL_STATUS.automaticallyCanceled;
  }

  if (status === SANTACASA_PEDIDO_STATUS.pending) {
    return SANTACASA_PEDIDO_VISUAL_STATUS.pending;
  }

  if (status === SANTACASA_PEDIDO_STATUS.validated) {
    return SANTACASA_PEDIDO_VISUAL_STATUS.validated;
  }

  if (status === SANTACASA_PEDIDO_STATUS.rejected) {
    return SANTACASA_PEDIDO_VISUAL_STATUS.rejected;
  }

  if (status === SANTACASA_PEDIDO_STATUS.canceled) {
    return SANTACASA_PEDIDO_VISUAL_STATUS.canceled;
  }

  return status;
}

export function getSantaCasaPedidoOperationalSummary(pedido) {
  const items = getSantaCasaPedidoItems(pedido);

  const pendingItems = getSantaCasaPedidoPendingItems(pedido);
  const validatedItems = getSantaCasaPedidoValidatedItems(pedido);
  const rejectedItems = getSantaCasaPedidoRejectedItems(pedido);
  const canceledItems = getSantaCasaPedidoCanceledItems(pedido);
  const expiredItems = getSantaCasaPedidoExpiredItems(pedido);

  return {
    totalItems: items.length,
    totalQuantity: getItemsQuantity(items),

    pendingItems: pendingItems.length,
    pendingQuantity: getItemsQuantity(pendingItems),

    validatedItems: validatedItems.length,
    validatedQuantity: getItemsQuantity(validatedItems),

    rejectedItems: rejectedItems.length,
    rejectedQuantity: getItemsQuantity(rejectedItems),

    canceledItems: canceledItems.length,
    canceledQuantity: getItemsQuantity(canceledItems),

    expiredItems: expiredItems.length,
    expiredQuantity: getItemsQuantity(expiredItems),

    hasExpiredItems: expiredItems.length > 0,
  };
}

export function compareSantaCasaPedidoOperationalItems(firstItem, secondItem) {
  const statusDifference =
    getItemStatusSortWeight(firstItem?.status) -
    getItemStatusSortWeight(secondItem?.status);

  if (statusDifference !== 0) {
    return statusDifference;
  }

  const typeComparison = collator.compare(
    firstItem?.tipo || "",
    secondItem?.tipo || "",
  );

  if (typeComparison !== 0) {
    return typeComparison;
  }

  return collator.compare(
    getSantaCasaPedidoItemMedicationLabel(firstItem),
    getSantaCasaPedidoItemMedicationLabel(secondItem),
  );
}
