// src/features/santacasa/pedidos/components/PedidoPendingList/pedidoPendingList.utils.js

import { SANTACASA_PEDIDO_VISUAL_STATUS } from "../../../shared/pedidos/config/santaCasaPedidoUi.config";

import {
  getSantaCasaPedidoItemsCount,
  getSantaCasaPedidoNumberLabel,
  getSantaCasaPedidoTotalQuantity,
  getSantaCasaPedidoUtentesCount,
} from "../../../shared/pedidos/utils/santaCasaPedido.utils";

import {
  getSantaCasaPedidoOperationalSummary,
  getSantaCasaPedidoVisualStatus,
  hasSantaCasaPedidoExpiredItems,
} from "../../../shared/pedidos/utils/santaCasaPedidoOperational.utils";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

export function getPedidoNumberLabel(pedido) {
  return getSantaCasaPedidoNumberLabel(pedido, {
    emptyValue: PEDIDOS_PAGE.labels.emptyValue,
  });
}

export function hasPedidoExpirationWarnings(pedido) {
  return hasSantaCasaPedidoExpiredItems(pedido);
}

export function getPedidoExpirationWarningsCount(pedido) {
  return getSantaCasaPedidoOperationalSummary(pedido).expiredItems;
}

export function getPedidoPendingMedicamentosCount(pedido) {
  return getSantaCasaPedidoOperationalSummary(pedido).pendingItems;
}

export function getPedidoPendingQuantity(pedido) {
  return getSantaCasaPedidoOperationalSummary(pedido).pendingQuantity;
}

export function getPedidoStatusLabel(pedido) {
  const visualStatus = getSantaCasaPedidoVisualStatus(pedido);

  if (visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.validatedWithWarnings) {
    return PEDIDOS_PAGE.labels.validatedWithWarningsStatus;
  }

  if (visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.pendingWithWarnings) {
    return PEDIDOS_PAGE.labels.pendingWithWarningsStatus;
  }

  if (visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.validated) {
    return PEDIDOS_PAGE.labels.validatedStatus;
  }

  if (visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.rejected) {
    return PEDIDOS_PAGE.labels.rejectedStatus;
  }

  if (
    visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.canceled ||
    visualStatus === SANTACASA_PEDIDO_VISUAL_STATUS.automaticallyCanceled
  ) {
    return PEDIDOS_PAGE.labels.canceledStatus;
  }

  return PEDIDOS_PAGE.labels.pendingStatus;
}

export function getPedidoTotalQuantity(pedido) {
  return getSantaCasaPedidoTotalQuantity(pedido);
}

export function getPedidoUtentesCount(pedido) {
  return getSantaCasaPedidoUtentesCount(pedido);
}

export function getPedidoMedicamentosCount(pedido) {
  return getSantaCasaPedidoItemsCount(pedido);
}

export function getPluralLabel({ amount, singular, plural }) {
  return Number(amount) === 1 ? singular : plural;
}

export function getUtentesCountLabel(count) {
  return `${count} ${getPluralLabel({
    amount: count,
    singular: PEDIDOS_PAGE.labels.utenteSingular,
    plural: PEDIDOS_PAGE.labels.utentePlural,
  })}`;
}

export function getMedicamentosCountLabel(count) {
  return `${count} ${getPluralLabel({
    amount: count,
    singular: PEDIDOS_PAGE.labels.itemSingular,
    plural: PEDIDOS_PAGE.labels.itemPlural,
  })}`;
}

export function getExpiredMedicamentosCountLabel(count) {
  return `${count} ${getPluralLabel({
    amount: count,
    singular: PEDIDOS_PAGE.labels.expiredItemSingular,
    plural: PEDIDOS_PAGE.labels.expiredItemPlural,
  })}`;
}

export function getUnidadesCountLabel(count) {
  return `${count} ${getPluralLabel({
    amount: count,
    singular: PEDIDOS_PAGE.labels.unidadeSingular,
    plural: PEDIDOS_PAGE.labels.unidadePlural,
  })}`;
}

export function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) {
    return PEDIDOS_PAGE.sections.pending.paginationEmptyLabel;
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return PEDIDOS_PAGE.sections.pending.paginationLabel
    .replace("{start}", start)
    .replace("{end}", end)
    .replace("{total}", total)
    .replace("{currentPage}", currentPage)
    .replace("{totalPages}", totalPages);
}
