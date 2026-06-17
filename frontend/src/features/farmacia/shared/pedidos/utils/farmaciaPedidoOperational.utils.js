// src/features/farmacia/shared/pedidos/utils/farmaciaPedidoOperational.utils.js
import { FARMACIA_PEDIDO_UI } from "../config/farmaciaPedidoUi.config";

const ITEM_STATUS = Object.freeze({
  PENDING: "PENDENTE",
  VALIDATED: "VALIDADO",
  EXPIRED: "CANCELADO_POR_EXPIRACAO",
});

const PEDIDO_STATUS = Object.freeze({
  PENDING: "PENDENTE",
  VALIDATED: "VALIDADO",
});

const UNKNOWN_LABEL = "—";

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function getPedidoItems(pedido) {
  return Array.isArray(pedido?.itens) ? pedido.itens : [];
}

function getItemQuantity(item) {
  const quantity = Number(item?.quantidade);

  return Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
}

export function getPedidoOperationalSummary(pedido) {
  const items = getPedidoItems(pedido);

  return items.reduce(
    (summary, item) => {
      const status = normalizeStatus(item?.status);

      const quantity = getItemQuantity(item);

      summary.totalItems += 1;
      summary.totalQuantity += quantity;

      if (status === ITEM_STATUS.PENDING) {
        summary.validatableItems += 1;
        summary.validatableQuantity += quantity;
      }

      if (status === ITEM_STATUS.VALIDATED) {
        summary.validatedItems += 1;
        summary.validatedQuantity += quantity;
      }

      if (status === ITEM_STATUS.EXPIRED) {
        summary.expiredItems += 1;
        summary.expiredQuantity += quantity;
      }

      return summary;
    },
    {
      totalItems: 0,
      totalQuantity: 0,

      validatableItems: 0,
      validatableQuantity: 0,

      validatedItems: 0,
      validatedQuantity: 0,

      expiredItems: 0,
      expiredQuantity: 0,

      hasExpiredItems: false,
    },
  );
}

export function finalizePedidoOperationalSummary(summary) {
  const safeSummary = {
    totalItems: Number(summary?.totalItems) || 0,

    totalQuantity: Number(summary?.totalQuantity) || 0,

    validatableItems: Number(summary?.validatableItems) || 0,

    validatableQuantity: Number(summary?.validatableQuantity) || 0,

    validatedItems: Number(summary?.validatedItems) || 0,

    validatedQuantity: Number(summary?.validatedQuantity) || 0,

    expiredItems: Number(summary?.expiredItems) || 0,

    expiredQuantity: Number(summary?.expiredQuantity) || 0,
  };

  return {
    ...safeSummary,

    hasExpiredItems: safeSummary.expiredItems > 0,
  };
}

export function buildPedidoOperationalSummary(pedido) {
  return finalizePedidoOperationalSummary(getPedidoOperationalSummary(pedido));
}

export function getPedidoVisualStatus(pedido, operationalSummary) {
  const status = normalizeStatus(pedido?.status);

  const warningLabel = operationalSummary?.hasExpiredItems
    ? FARMACIA_PEDIDO_UI.warnings.status[status]
    : null;

  return {
    status,
    hasWarning: Boolean(warningLabel),

    label:
      warningLabel ||
      FARMACIA_PEDIDO_UI.status[status] ||
      status ||
      UNKNOWN_LABEL,
  };
}

export function getPedidoWarning(pedido, operationalSummary) {
  if (!operationalSummary?.hasExpiredItems) {
    return null;
  }

  const status = normalizeStatus(pedido?.status);

  if (status === PEDIDO_STATUS.PENDING) {
    return FARMACIA_PEDIDO_UI.warnings.pending;
  }

  if (status === PEDIDO_STATUS.VALIDATED) {
    return FARMACIA_PEDIDO_UI.warnings.validated;
  }

  return null;
}
