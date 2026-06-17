

import { useMemo } from "react";

import { formatDateTime } from "../../../../../../shared/utils/formatDate";

import {
  SANTACASA_PEDIDO_STATUS,
  SANTACASA_PEDIDO_UI,
  SANTACASA_PEDIDO_VISUAL_STATUS,
} from "../../config/santaCasaPedidoUi.config";

import { getSantaCasaPedidoNumberLabel } from "../../utils/santaCasaPedido.utils";

import {
  getSantaCasaPedidoOperationalSummary,
  getSantaCasaPedidoVisualStatus,
} from "../../utils/santaCasaPedidoOperational.utils";

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function getPedidoWarning({ status, visualStatus, hasExpiredItems }) {
  if (!hasExpiredItems) {
    return null;
  }

  if (
    status === SANTACASA_PEDIDO_STATUS.pending ||
    visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.pendingWithWarnings
  ) {
    return SANTACASA_PEDIDO_UI.warnings.pending;
  }

  if (
    status === SANTACASA_PEDIDO_STATUS.validated ||
    visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.validatedWithWarnings
  ) {
    return SANTACASA_PEDIDO_UI.warnings.validated;
  }

  return null;
}

export function useSantaCasaPedidoCard(pedido) {
  const operationalSummary = useMemo(() => {
    return getSantaCasaPedidoOperationalSummary(pedido);
  }, [pedido]);

  const visualStatusCode = useMemo(() => {
    return getSantaCasaPedidoVisualStatus(pedido);
  }, [pedido]);

  const status = normalizeStatus(pedido?.status);

  const statusLabel =
    SANTACASA_PEDIDO_UI.pedidoStatus[visualStatusCode] ||
    visualStatusCode ||
    SANTACASA_PEDIDO_UI.labels.emptyValue;

  const warning = getPedidoWarning({
    status,
    visualStatus: visualStatusCode,
    hasExpiredItems: operationalSummary.hasExpiredItems,
  });

  return {
    pedidoNumberLabel: getSantaCasaPedidoNumberLabel(pedido),

    operationalSummary,

    visualStatus: {
      status,
      label: statusLabel,
      hasWarning: Boolean(warning),
    },

    warning,

    dateLabel: SANTACASA_PEDIDO_UI.labels.createdAt,

    dateValue: formatDateTime(pedido?.createdAt),
  };
}
