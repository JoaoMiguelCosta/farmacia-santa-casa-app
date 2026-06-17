// src/features/santacasa/historico/utils/santaCasaHistoricoDetail.utils.js

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoCancellationNoticeTitle,
  getHistoricoPedidoCancellationReleaseMessage,
  getHistoricoPedidoClosedAtLabel,
  getHistoricoPedidoClosedReasonLabel,
  getHistoricoPedidoClosedReasonTitle,
  getHistoricoPedidoMessage,
  getHistoricoPedidoNumberLabel,
  getHistoricoPedidoVisualStatusLabel,
  getHistoricoPedidoWarningNoticeMessage,
  getHistoricoPedidoWarningNoticeTitle,
  isHistoricoPedidoCancelado,
  isHistoricoPedidoCanceladoPorExpiracao,
  isHistoricoPedidoValidadoComAvisos,
  shouldShowHistoricoPedidoReason,
} from "../../utils/santaCasaHistorico.utils";

import {
  getSantaCasaPedidoOperationalSummary,
  getSantaCasaPedidoVisualStatus,
} from "../../../shared/pedidos/utils/santaCasaPedidoOperational.utils";

import { getSantaCasaPedidoUtentesCount } from "../../../shared/pedidos/utils/santaCasaPedido.utils";

import { SANTACASA_PEDIDO_VISUAL_STATUS } from "../../../shared/pedidos/config/santaCasaPedidoUi.config";

function getAuditUserLabel(user) {
  return (
    user?.name || user?.email || SANTACASA_HISTORICO_PAGE.labels.emptyValue
  );
}

function getDecisionInfo(pedido) {
  if (pedido?.status === "VALIDADO") {
    return {
      dateLabel: SANTACASA_HISTORICO_PAGE.labels.validatedAt,
      actorLabel: SANTACASA_HISTORICO_PAGE.labels.validatedBy,
      actorValue: getAuditUserLabel(pedido?.validatedBy),
    };
  }

  if (pedido?.status === "REJEITADO") {
    return {
      dateLabel: SANTACASA_HISTORICO_PAGE.labels.rejectedAt,
      actorLabel: SANTACASA_HISTORICO_PAGE.labels.rejectedBy,
      actorValue: getAuditUserLabel(pedido?.rejectedBy),
    };
  }

  if (pedido?.status === "CANCELADO") {
    const actorValue = isHistoricoPedidoCanceladoPorExpiracao(pedido)
      ? SANTACASA_HISTORICO_PAGE.labels.systemAutomatic
      : getAuditUserLabel(pedido?.canceledBy);

    return {
      dateLabel: SANTACASA_HISTORICO_PAGE.labels.canceledAt,
      actorLabel: SANTACASA_HISTORICO_PAGE.labels.canceledBy,
      actorValue,
    };
  }

  return {
    dateLabel: SANTACASA_HISTORICO_PAGE.labels.closedAt,
    actorLabel: SANTACASA_HISTORICO_PAGE.labels.closedBy,
    actorValue: SANTACASA_HISTORICO_PAGE.labels.emptyValue,
  };
}

function getDetailTone(pedido) {
  const visualStatus = getSantaCasaPedidoVisualStatus(pedido);

  if (visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.validatedWithWarnings) {
    return "warning";
  }

  if (visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.validated) {
    return "success";
  }

  if (
    visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.rejected ||
    visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.canceled ||
    visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.automaticallyCanceled
  ) {
    return "danger";
  }

  return "neutral";
}

function createMetric(key, label, value, tone = "neutral") {
  return {
    key,
    label,
    value,
    tone,
  };
}

function getOperationalMetrics(pedido, summary) {
  const labels = SANTACASA_HISTORICO_PAGE.detail.operational.labels;

  if (pedido?.status === "VALIDADO") {
    const metrics = [
      createMetric(
        "validatedItems",
        labels.validatedItems,
        summary.validatedItems || summary.totalItems,
        "success",
      ),
      createMetric(
        "validatedQuantity",
        labels.validatedQuantity,
        summary.validatedQuantity || summary.totalQuantity,
        "success",
      ),
    ];

    if (summary.expiredItems > 0) {
      metrics.push(
        createMetric(
          "expiredItems",
          labels.expiredItems,
          summary.expiredItems,
          "warning",
        ),
        createMetric(
          "expiredQuantity",
          labels.expiredQuantity,
          summary.expiredQuantity,
          "warning",
        ),
      );
    }

    return metrics;
  }

  if (pedido?.status === "REJEITADO") {
    return [
      createMetric(
        "rejectedItems",
        labels.rejectedItems,
        summary.rejectedItems || summary.totalItems,
        "danger",
      ),
      createMetric(
        "rejectedQuantity",
        labels.rejectedQuantity,
        summary.rejectedQuantity || summary.totalQuantity,
        "danger",
      ),
    ];
  }

  if (pedido?.status === "CANCELADO") {
    const metrics = [
      createMetric(
        "canceledItems",
        labels.canceledItems,
        summary.canceledItems + summary.expiredItems || summary.totalItems,
        "danger",
      ),
      createMetric(
        "releasedQuantity",
        labels.releasedQuantity,
        summary.totalQuantity,
        "danger",
      ),
    ];

    if (summary.expiredItems > 0) {
      metrics.splice(
        1,
        0,
        createMetric(
          "expiredItems",
          labels.expiredItems,
          summary.expiredItems,
          "warning",
        ),
      );
    }

    return metrics;
  }

  return [
    createMetric("totalItems", labels.totalItems, summary.totalItems),
    createMetric("totalQuantity", labels.totalQuantity, summary.totalQuantity),
  ];
}

export function getSantaCasaHistoricoDetailViewModel(pedido) {
  const detail = SANTACASA_HISTORICO_PAGE.detail;

  const decisionInfo = getDecisionInfo(pedido);

  const operationalSummary = getSantaCasaPedidoOperationalSummary(pedido);

  const showReason = shouldShowHistoricoPedidoReason(pedido);

  const showWarningNotice = isHistoricoPedidoValidadoComAvisos(pedido);

  const showCancellationNotice = isHistoricoPedidoCancelado(pedido);

  return {
    tone: getDetailTone(pedido),

    pedidoNumberLabel: getHistoricoPedidoNumberLabel(pedido),

    statusLabel: getHistoricoPedidoVisualStatusLabel(pedido),

    message: getHistoricoPedidoMessage(pedido),

    summaryItems: [
      {
        key: "pedido",
        label: detail.summary.labels.pedido,
        value: getHistoricoPedidoNumberLabel(pedido),
      },
      {
        key: "status",
        label: detail.summary.labels.status,
        value: getHistoricoPedidoVisualStatusLabel(pedido),
      },
      {
        key: "decisionDate",
        label: decisionInfo.dateLabel,
        value: getHistoricoPedidoClosedAtLabel(pedido),
      },
      {
        key: "decisionActor",
        label: decisionInfo.actorLabel,
        value: decisionInfo.actorValue,
      },
      {
        key: "utentes",
        label: detail.summary.labels.utentes,
        value: getSantaCasaPedidoUtentesCount(pedido),
      },
      {
        key: "items",
        label: detail.summary.labels.totalItems,
        value: operationalSummary.totalItems,
      },
      {
        key: "quantity",
        label: detail.summary.labels.totalQuantity,
        value: operationalSummary.totalQuantity,
      },
    ],

    operationalMetrics: getOperationalMetrics(pedido, operationalSummary),

    showReason,

    reasonTitle: showReason ? getHistoricoPedidoClosedReasonTitle(pedido) : "",

    reasonValue: showReason ? getHistoricoPedidoClosedReasonLabel(pedido) : "",

    showWarningNotice,

    warningNoticeTitle: showWarningNotice
      ? getHistoricoPedidoWarningNoticeTitle(pedido)
      : "",

    warningNoticeMessage: showWarningNotice
      ? getHistoricoPedidoWarningNoticeMessage(pedido)
      : "",

    showCancellationNotice,

    cancellationNoticeTitle: showCancellationNotice
      ? getHistoricoPedidoCancellationNoticeTitle(pedido)
      : "",

    cancellationNoticeMessage: showCancellationNotice
      ? getHistoricoPedidoCancellationReleaseMessage(pedido)
      : "",
  };
}
