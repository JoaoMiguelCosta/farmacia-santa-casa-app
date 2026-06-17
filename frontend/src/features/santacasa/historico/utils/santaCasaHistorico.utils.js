// src/features/santacasa/historico/utils/santaCasaHistorico.utils.js

import { formatDateTime } from "../../../../shared/utils/formatDate";

import { SANTACASA_PEDIDO_VISUAL_STATUS } from "../../shared/pedidos/config/santaCasaPedidoUi.config";

import { getSantaCasaPedidoNumberLabel } from "../../shared/pedidos/utils/santaCasaPedido.utils";

import {
  getSantaCasaPedidoVisualStatus,
  isSantaCasaPedidoCanceled,
  isSantaCasaPedidoCanceledByExpiration,
} from "../../shared/pedidos/utils/santaCasaPedidoOperational.utils";

import { SANTACASA_HISTORICO_PAGE } from "../config/santaCasaHistoricoPage.config";

const UNKNOWN_LABEL = SANTACASA_HISTORICO_PAGE.labels.emptyValue;

function getHistoricoPedidoStatusLabel(status) {
  return SANTACASA_HISTORICO_PAGE.status[status] || status || UNKNOWN_LABEL;
}

function isHistoricoPedidoCanceladoManualmente(pedido) {
  return (
    isHistoricoPedidoCancelado(pedido) &&
    !isHistoricoPedidoCanceladoPorExpiracao(pedido)
  );
}

export function getHistoricoPedidoNumberLabel(pedido) {
  return getSantaCasaPedidoNumberLabel(pedido, {
    emptyValue: UNKNOWN_LABEL,
  });
}

export function getHistoricoPedidoVisualStatusLabel(pedido) {
  const visualStatus = getSantaCasaPedidoVisualStatus(pedido);

  if (visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.automaticallyCanceled) {
    return SANTACASA_HISTORICO_PAGE.status.CANCELADO;
  }

  return getHistoricoPedidoStatusLabel(visualStatus);
}

export function getHistoricoPedidoClosedAtLabel(pedido) {
  const closedAt =
    pedido?.validatedAt ||
    pedido?.rejectedAt ||
    pedido?.updatedAt ||
    pedido?.createdAt;

  return formatDateTime(closedAt);
}

export function isHistoricoPedidoCancelado(pedido) {
  return isSantaCasaPedidoCanceled(pedido);
}

export function isHistoricoPedidoValidadoComAvisos(pedido) {
  return (
    getSantaCasaPedidoVisualStatus(pedido) ===
    SANTACASA_PEDIDO_VISUAL_STATUS.validatedWithWarnings
  );
}

export function isHistoricoPedidoCanceladoPorExpiracao(pedido) {
  return isSantaCasaPedidoCanceledByExpiration(pedido);
}

export function getHistoricoPedidoMessage(pedido) {
  if (isHistoricoPedidoValidadoComAvisos(pedido)) {
    return SANTACASA_HISTORICO_PAGE.messages.validatedWithWarnings;
  }

  if (pedido?.status === "VALIDADO") {
    return SANTACASA_HISTORICO_PAGE.messages.validated;
  }

  if (pedido?.status === "REJEITADO") {
    return SANTACASA_HISTORICO_PAGE.messages.rejected;
  }

  if (isHistoricoPedidoCanceladoPorExpiracao(pedido)) {
    return SANTACASA_HISTORICO_PAGE.messages.cancelledByExpiry;
  }

  if (isHistoricoPedidoCanceladoManualmente(pedido)) {
    return SANTACASA_HISTORICO_PAGE.messages.cancelledManually;
  }

  return "";
}

export function getHistoricoPedidoWarningNoticeTitle(pedido) {
  if (!isHistoricoPedidoValidadoComAvisos(pedido)) {
    return "";
  }

  return SANTACASA_HISTORICO_PAGE.labels.validatedWithWarningsNoticeTitle;
}

export function getHistoricoPedidoWarningNoticeMessage(pedido) {
  if (!isHistoricoPedidoValidadoComAvisos(pedido)) {
    return "";
  }

  return SANTACASA_HISTORICO_PAGE.messages.validatedWithWarningsNotice;
}

export function getHistoricoPedidoCancellationNoticeTitle(pedido) {
  if (isHistoricoPedidoCanceladoPorExpiracao(pedido)) {
    return SANTACASA_HISTORICO_PAGE.labels.automaticCancellationNoticeTitle;
  }

  return SANTACASA_HISTORICO_PAGE.labels.manualCancellationNoticeTitle;
}

export function getHistoricoPedidoCancellationReleaseMessage(pedido) {
  if (isHistoricoPedidoCanceladoPorExpiracao(pedido)) {
    return SANTACASA_HISTORICO_PAGE.messages.cancelledByExpiryRelease;
  }

  return SANTACASA_HISTORICO_PAGE.messages.cancelledManuallyRelease;
}

export function getHistoricoPedidoClosedReasonTitle(pedido) {
  if (pedido?.status === "REJEITADO") {
    return SANTACASA_HISTORICO_PAGE.labels.rejectionReason;
  }

  if (pedido?.status === "CANCELADO") {
    return SANTACASA_HISTORICO_PAGE.labels.cancellationReason;
  }

  return SANTACASA_HISTORICO_PAGE.labels.closedReason;
}

export function getHistoricoPedidoClosedReasonLabel(pedido) {
  const reason = String(
    pedido?.closedReason || pedido?.cancelReason || "",
  ).trim();

  return reason || SANTACASA_HISTORICO_PAGE.messages.noReason;
}

export function shouldShowHistoricoPedidoReason(pedido) {
  return ["REJEITADO", "CANCELADO"].includes(pedido?.status);
}
