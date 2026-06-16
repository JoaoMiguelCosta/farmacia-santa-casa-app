import {
  getPedidoNumberLabel,
  getPedidoUtentesCount,
} from "../../../shared/pedidos/utils/farmaciaPedido.utils";

import { FARMACIA_PEDIDOS_PAGE } from "../../config/farmaciaPedidosPage.config";

import { DIALOG_MODES } from "./farmaciaPedidoDecisionDialog.config";

export const FOCUSABLE_ELEMENTS_SELECTOR = [
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function getDialogConfig(mode) {
  if (mode === DIALOG_MODES.REJECT) {
    return FARMACIA_PEDIDOS_PAGE.rejectDialog;
  }

  return FARMACIA_PEDIDOS_PAGE.validateDialog;
}

export function getFocusableElements(container) {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR),
  ).filter((element) => {
    return element instanceof HTMLElement;
  });
}

export function buildDefaultMetrics({ pedido, summary, labels }) {
  return [
    {
      key: "pedido",
      label: labels.pedido,
      value: getPedidoNumberLabel(pedido),
    },
    {
      key: "utentes",
      label: labels.totalUtentes,
      value: getPedidoUtentesCount(pedido),
    },
    {
      key: "items",
      label: labels.totalItems,
      value: summary.totalItems,
    },
    {
      key: "quantity",
      label: labels.totalQuantity,
      value: summary.totalQuantity,
    },
  ];
}

export function buildWarningMetrics({ mode, pedido, summary, labels }) {
  const isRejectMode = mode === DIALOG_MODES.REJECT;

  return [
    {
      key: "pedido",
      label: labels.pedido,
      value: getPedidoNumberLabel(pedido),
    },
    {
      key: "utentes",
      label: labels.totalUtentes,
      value: getPedidoUtentesCount(pedido),
    },
    {
      key: "pending-items",
      label: isRejectMode ? labels.rejectableItems : labels.validatableItems,
      value: summary.validatableItems,
      tone: "success",
    },
    {
      key: "pending-quantity",
      label: isRejectMode
        ? labels.rejectableQuantity
        : labels.validatableQuantity,
      value: summary.validatableQuantity,
      tone: "success",
    },
    {
      key: "expired-items",
      label: labels.expiredItems,
      value: summary.expiredItems,
      tone: "danger",
    },
    {
      key: "expired-quantity",
      label: labels.expiredQuantity,
      value: summary.expiredQuantity,
      tone: "danger",
    },
  ];
}
