// src/features/santacasa/historico/utils/santaCasaHistoricoItems.utils.js

import { SANTACASA_HISTORICO_PAGE } from "../config/santaCasaHistoricoPage.config";

const UNKNOWN_LABEL = SANTACASA_HISTORICO_PAGE.labels.emptyValue;

export function getHistoricoPedidoItemStatusLabel(status) {
  return SANTACASA_HISTORICO_PAGE.itemStatus[status] || status || UNKNOWN_LABEL;
}

export function getHistoricoPedidoItemTypeLabel(tipo) {
  return SANTACASA_HISTORICO_PAGE.itemTypes[tipo] || tipo || UNKNOWN_LABEL;
}

export function isHistoricoPedidoItemCanceladoPorExpiracao(item) {
  return item?.status === "CANCELADO_POR_EXPIRACAO";
}

export function isHistoricoPedidoItemValidado(item) {
  return item?.status === "VALIDADO";
}

export function isHistoricoPedidoItemCancelado(item) {
  return item?.status === "CANCELADO";
}

export function getHistoricoPedidoItemExpiryNoticeMessage(item) {
  if (!isHistoricoPedidoItemCanceladoPorExpiracao(item)) {
    return "";
  }

  return SANTACASA_HISTORICO_PAGE.messages.itemCancelledByExpiry;
}

export function getHistoricoPedidoItemMedicamentoLabel(item) {
  return item?.medicamento || UNKNOWN_LABEL;
}

export function getHistoricoPedidoItemQuantityLabel(item) {
  const quantidade = Number(item?.quantidade);

  if (!Number.isFinite(quantidade)) {
    return UNKNOWN_LABEL;
  }

  return String(quantidade);
}

export function getHistoricoPedidoItemUtenteLabel(item) {
  const nome = item?.utente?.nome || UNKNOWN_LABEL;
  const numero9 = item?.utente?.numero9 || UNKNOWN_LABEL;

  return `${nome} · ${numero9}`;
}

export function getHistoricoPedidoExtraReferenceLabel(item) {
  if (item?.tipo !== "EXTRA") {
    return "";
  }

  return SANTACASA_HISTORICO_PAGE.labels.extra;
}

export function getHistoricoPedidoExtraMetaLabel(item) {
  if (item?.tipo !== "EXTRA") {
    return "";
  }

  const quantidadeSolicitada = Number(item?.extra?.quantidadeSolicitada) || 0;

  const quantidadeRegularizada =
    Number(item?.extra?.quantidadeRegularizada) || 0;

  const labels = SANTACASA_HISTORICO_PAGE.labels;

  return [
    `${labels.extraRequestedQuantity} ${quantidadeSolicitada}`,
    `${labels.extraRegularizedQuantity} ${quantidadeRegularizada}`,
  ].join(" · ");
}
