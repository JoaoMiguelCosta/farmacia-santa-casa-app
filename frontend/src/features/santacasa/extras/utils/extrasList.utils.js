// src/features/santacasa/extras/utils/extrasList.utils.js
import { formatDateTime } from "../../../../shared/utils/formatDate";

import { EXTRAS_PAGE } from "../config/extrasPage.config";

export function getExtraPedidoKey(item) {
  return `EXTRA:${item.id}`;
}

export function getExtraRequestedQuantity(item) {
  return Math.max(
    0,
    Number(item?.quantidadeSolicitada ?? item?.quantidade ?? 0) || 0,
  );
}

export function getExtraDispensedQuantity(item) {
  return Math.max(0, Number(item?.quantidadeDispensada) || 0);
}

export function getExtraRemainingQuantity(item) {
  const explicitRemaining = Number(item?.quantidadeRestante);

  if (Number.isFinite(explicitRemaining)) {
    return Math.max(0, explicitRemaining);
  }

  return Math.max(
    0,
    getExtraRequestedQuantity(item) - getExtraDispensedQuantity(item),
  );
}

export function getExtraPendingQuantity(item) {
  const explicitPending =
    item?.quantidadeReservadaPendente ??
    item?.quantidadeEmPedido ??
    item?.quantidadePendente;

  const parsedExplicitPending = Number(explicitPending);

  if (Number.isFinite(parsedExplicitPending)) {
    return Math.max(0, parsedExplicitPending);
  }

  const total = getExtraRequestedQuantity(item);
  const dispensada = getExtraDispensedQuantity(item);
  const restante = getExtraRemainingQuantity(item);

  return Math.max(0, total - dispensada - restante);
}

export function getExtraAvailableQuantity(item, pedidoItemsQuantities = {}) {
  const pedidoKey = getExtraPedidoKey(item);
  const quantidadeRestante = getExtraRemainingQuantity(item);
  const quantidadeEmPedidoLocal = Number(pedidoItemsQuantities[pedidoKey]) || 0;

  return Math.max(0, quantidadeRestante - quantidadeEmPedidoLocal);
}

export function buildPedidoItem(item) {
  const quantidadeRestante = getExtraRemainingQuantity(item);

  return {
    key: getExtraPedidoKey(item),
    tipo: "EXTRA",
    id: item.id,
    title: item.medicamento,
    description: EXTRAS_PAGE.list.labels.extraDescription,
    meta: `${EXTRAS_PAGE.list.labels.total} ${getExtraRequestedQuantity(
      item,
    )} · ${EXTRAS_PAGE.list.labels.dispensada} ${getExtraDispensedQuantity(
      item,
    )}`,
    quantidadeRestante,
    source: item,
  };
}

export function getInputQuantity(value, max) {
  if (max <= 0) return 0;

  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}

export function getPedidoButtonLabel(quantidadeDisponivel) {
  if (quantidadeDisponivel <= 0) {
    return EXTRAS_PAGE.list.pedidoActions.noStockLabel;
  }

  return EXTRAS_PAGE.list.pedidoActions.addLabel;
}

export function formatCreatedAt(value) {
  if (!value) return EXTRAS_PAGE.list.emptyValue;

  return formatDateTime(value);
}
