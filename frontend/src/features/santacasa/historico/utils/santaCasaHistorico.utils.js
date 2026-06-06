// src/features/santacasa/historico/utils/santaCasaHistorico.utils.js

import { formatDateTime } from "../../../../shared/utils/formatDate";

import { SANTACASA_HISTORICO_PAGE } from "../config/santaCasaHistoricoPage.config";

import {
  isHistoricoPedidoItemCanceladoPorExpiracao,
  isHistoricoPedidoItemValidado,
} from "./santaCasaHistoricoItems.utils";

const UNKNOWN_LABEL = SANTACASA_HISTORICO_PAGE.labels.emptyValue;

function getHistoricoPedidoStatusLabel(status) {
  return SANTACASA_HISTORICO_PAGE.status[status] || status || UNKNOWN_LABEL;
}

function getHistoricoPedidoVisualStatus(pedido) {
  if (isHistoricoPedidoValidadoComAvisos(pedido)) {
    return "VALIDADO_COM_AVISOS";
  }

  return pedido?.status || "";
}

function getHistoricoPedidoItensValidados(pedido) {
  return getHistoricoPedidoItems(pedido).filter(isHistoricoPedidoItemValidado);
}

function getHistoricoPedidoItensCanceladosPorExpiracao(pedido) {
  return getHistoricoPedidoItems(pedido).filter(
    isHistoricoPedidoItemCanceladoPorExpiracao,
  );
}

function hasHistoricoPedidoItensCanceladosPorExpiracao(pedido) {
  return getHistoricoPedidoItems(pedido).some(
    isHistoricoPedidoItemCanceladoPorExpiracao,
  );
}

function isHistoricoPedidoCanceladoManualmente(pedido) {
  return (
    isHistoricoPedidoCancelado(pedido) &&
    !isHistoricoPedidoCanceladoPorExpiracao(pedido)
  );
}

function getHistoricoPedidoUtentes(pedido) {
  const utentesMap = new Map();

  getHistoricoPedidoItems(pedido).forEach((item) => {
    const utente = item?.utente;

    if (!utente?.id) {
      return;
    }

    utentesMap.set(utente.id, {
      id: utente.id,
      nome: utente.nome || UNKNOWN_LABEL,
      numero9: utente.numero9 || UNKNOWN_LABEL,
    });
  });

  return Array.from(utentesMap.values());
}

export function getHistoricoPedidoNumberLabel(pedido) {
  const numero = Number(pedido?.numero);

  if (!Number.isFinite(numero)) {
    return UNKNOWN_LABEL;
  }

  return `#${numero}`;
}

export function getHistoricoPedidoVisualStatusLabel(pedido) {
  return getHistoricoPedidoStatusLabel(getHistoricoPedidoVisualStatus(pedido));
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
  return pedido?.status === "CANCELADO";
}

export function getHistoricoPedidoItems(pedido) {
  if (Array.isArray(pedido?.itens)) {
    return pedido.itens;
  }

  if (Array.isArray(pedido?.items)) {
    return pedido.items;
  }

  return [];
}

export function getHistoricoPedidoValidatedItemsCount(pedido) {
  return getHistoricoPedidoItensValidados(pedido).length;
}

export function getHistoricoPedidoExpiredCanceledItemsCount(pedido) {
  return getHistoricoPedidoItensCanceladosPorExpiracao(pedido).length;
}

export function getHistoricoPedidoValidatedQuantity(pedido) {
  return getHistoricoPedidoItensValidados(pedido).reduce((total, item) => {
    return total + (Number(item?.quantidade) || 0);
  }, 0);
}

export function getHistoricoPedidoExpiredCanceledQuantity(pedido) {
  return getHistoricoPedidoItensCanceladosPorExpiracao(pedido).reduce(
    (total, item) => {
      return total + (Number(item?.quantidade) || 0);
    },
    0,
  );
}

export function isHistoricoPedidoValidadoComAvisos(pedido) {
  return (
    pedido?.status === "VALIDADO" &&
    hasHistoricoPedidoItensCanceladosPorExpiracao(pedido)
  );
}

export function isHistoricoPedidoCanceladoPorExpiracao(pedido) {
  if (!isHistoricoPedidoCancelado(pedido)) {
    return false;
  }

  const reason = String(pedido?.closedReason || pedido?.cancelReason || "")
    .trim()
    .toLocaleLowerCase("pt-PT");

  if (reason.includes("expiração") || reason.includes("expiracao")) {
    return true;
  }

  return getHistoricoPedidoItems(pedido).some(
    isHistoricoPedidoItemCanceladoPorExpiracao,
  );
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

export function getHistoricoPedidoItemsCount(pedido) {
  return getHistoricoPedidoItems(pedido).length;
}

export function getHistoricoPedidoTotalQuantity(pedido) {
  return getHistoricoPedidoItems(pedido).reduce((total, item) => {
    return total + (Number(item?.quantidade) || 0);
  }, 0);
}

export function getHistoricoPedidoUtentesLabel(pedido) {
  const utentes = getHistoricoPedidoUtentes(pedido);

  if (utentes.length === 0) {
    return UNKNOWN_LABEL;
  }

  return utentes
    .map((utente) => `${utente.nome} · ${utente.numero9}`)
    .join(", ");
}
