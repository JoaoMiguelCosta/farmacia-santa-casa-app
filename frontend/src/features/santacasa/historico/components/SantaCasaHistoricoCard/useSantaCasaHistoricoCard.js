// src/features/santacasa/historico/components/SantaCasaHistoricoCard/useSantaCasaHistoricoCard.js

import styles from "./SantaCasaHistoricoCard.module.css";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoClosedAtLabel,
  getHistoricoPedidoClosedReasonLabel,
  getHistoricoPedidoMessage,
  getHistoricoPedidoNumberLabel,
  getHistoricoPedidoVisualStatusLabel,
  isHistoricoPedidoCancelado,
  isHistoricoPedidoValidadoComAvisos,
  shouldShowHistoricoPedidoReason,
} from "../../utils/santaCasaHistorico.utils";

import {
  getSantaCasaPedidoOperationalSummary,
  isSantaCasaPedidoCanceledByExpiration,
} from "../../../shared/pedidos/utils/santaCasaPedidoOperational.utils";

import { getSantaCasaPedidoUtentesCount } from "../../../shared/pedidos/utils/santaCasaPedido.utils";

function isHistoricoPedidoRejeitado(pedido) {
  return pedido?.status === "REJEITADO";
}

function getHistoricoCardClassName(pedido) {
  return [
    styles.card,

    pedido?.status === "VALIDADO" ? styles.cardValidated : "",

    isHistoricoPedidoValidadoComAvisos(pedido) ? styles.cardWarning : "",

    isHistoricoPedidoRejeitado(pedido) ? styles.cardRejected : "",

    isHistoricoPedidoCancelado(pedido) ? styles.cardCancelled : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function getResultMetric(pedido, summary) {
  const labels = SANTACASA_HISTORICO_PAGE.labels;

  if (pedido?.status === "VALIDADO") {
    return {
      label: labels.statsValidated,

      value: summary.validatedItems || summary.totalItems,

      tone: "success",
    };
  }

  if (pedido?.status === "REJEITADO") {
    return {
      label: labels.statsRejected,

      value: summary.rejectedItems || summary.totalItems,

      tone: "danger",
    };
  }

  if (pedido?.status === "CANCELADO") {
    return {
      label: isSantaCasaPedidoCanceledByExpiration(pedido)
        ? labels.statsCanceledByExpiry
        : labels.statsCanceled,

      value: summary.canceledItems + summary.expiredItems || summary.totalItems,

      tone: "danger",
    };
  }

  return {
    label: labels.totalItems,
    value: summary.totalItems,
    tone: "neutral",
  };
}

function getSummaryItems(pedido) {
  const labels = SANTACASA_HISTORICO_PAGE.labels;

  const summary = getSantaCasaPedidoOperationalSummary(pedido);

  const resultMetric = getResultMetric(pedido, summary);

  return [
    {
      key: "utentes",
      label: labels.utentes,

      value: getSantaCasaPedidoUtentesCount(pedido),

      tone: "neutral",
    },
    {
      key: "items",
      label: labels.totalItems,
      value: summary.totalItems,
      tone: "neutral",
    },
    {
      key: "quantity",
      label: labels.totalQuantity,
      value: summary.totalQuantity,
      tone: "neutral",
    },
    {
      key: "result",
      ...resultMetric,
    },
  ];
}

export function useSantaCasaHistoricoCard(pedido) {
  const operationalSummary = getSantaCasaPedidoOperationalSummary(pedido);

  const hasExpirationWarning = operationalSummary.expiredItems > 0;

  const showReason = shouldShowHistoricoPedidoReason(pedido);

  return {
    cardClassName: getHistoricoCardClassName(pedido),

    pedidoNumberLabel: getHistoricoPedidoNumberLabel(pedido),

    statusLabel: getHistoricoPedidoVisualStatusLabel(pedido),

    closedAtLabel: getHistoricoPedidoClosedAtLabel(pedido),

    message: getHistoricoPedidoMessage(pedido),

    summaryItems: getSummaryItems(pedido),

    hasExpirationWarning,

    expirationWarningLabel: `${operationalSummary.expiredItems} ${
      operationalSummary.expiredItems === 1
        ? SANTACASA_HISTORICO_PAGE.labels.warningSingular
        : SANTACASA_HISTORICO_PAGE.labels.warningPlural
    }`,

    showReason,

    reasonTitle: showReason ? SANTACASA_HISTORICO_PAGE.labels.closedReason : "",

    reasonValue: showReason ? getHistoricoPedidoClosedReasonLabel(pedido) : "",
  };
}
