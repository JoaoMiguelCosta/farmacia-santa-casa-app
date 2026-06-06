import { SANTACASA_HISTORICO_PAGE } from "../../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoItems,
  isHistoricoPedidoValidadoComAvisos,
} from "../../../utils/santaCasaHistorico.utils";

function getItemStatus(item) {
  return String(item?.status || "").toUpperCase();
}

function getSafeQuantity(value) {
  const numberValue = Number(value);

  if (Number.isFinite(numberValue)) return numberValue;

  return 0;
}

function getItemQuantity(item) {
  return getSafeQuantity(item?.quantidade);
}

function getItemsCountByStatus(items, statuses) {
  const allowedStatuses = new Set(statuses);

  return items.filter((item) => allowedStatuses.has(getItemStatus(item)))
    .length;
}

function getQuantityByStatus(items, statuses) {
  const allowedStatuses = new Set(statuses);

  return items.reduce((total, item) => {
    if (!allowedStatuses.has(getItemStatus(item))) return total;

    return total + getItemQuantity(item);
  }, 0);
}

function getTotalQuantity(items) {
  return items.reduce((total, item) => {
    return total + getItemQuantity(item);
  }, 0);
}

function getPedidoStatus(pedido) {
  return String(pedido?.status || "").toUpperCase();
}

function createStat({ key, label, value, variant = "neutral" }) {
  return {
    key,
    label,
    value,
    variant,
  };
}

function getValidatedStats(items, pedido) {
  const hasWarnings = isHistoricoPedidoValidadoComAvisos(pedido);

  const validatedItems = getItemsCountByStatus(items, ["VALIDADO"]);
  const validatedQuantity = getQuantityByStatus(items, ["VALIDADO"]);

  const expiredItems = getItemsCountByStatus(items, [
    "CANCELADO_POR_EXPIRACAO",
  ]);

  const expiredQuantity = getQuantityByStatus(items, [
    "CANCELADO_POR_EXPIRACAO",
  ]);

  if (hasWarnings || expiredItems > 0) {
    return {
      variant: "warning",
      stats: [
        createStat({
          key: "validatedItems",
          label: SANTACASA_HISTORICO_PAGE.labels.statsValidated,
          value: validatedItems,
          variant: "success",
        }),
        createStat({
          key: "expiredItems",
          label: SANTACASA_HISTORICO_PAGE.labels.statsCanceledByExpiry,
          value: expiredItems,
          variant: "warning",
        }),
        createStat({
          key: "validatedQuantity",
          label: SANTACASA_HISTORICO_PAGE.labels.statsValidatedQuantity,
          value: validatedQuantity,
          variant: "success",
        }),
        createStat({
          key: "notValidatedQuantity",
          label: SANTACASA_HISTORICO_PAGE.labels.statsNotValidatedQuantity,
          value: expiredQuantity,
          variant: "warning",
        }),
      ],
    };
  }

  return {
    variant: "success",
    stats: [
      createStat({
        key: "validatedItems",
        label: SANTACASA_HISTORICO_PAGE.labels.statsValidated,
        value: validatedItems || items.length,
        variant: "success",
      }),
      createStat({
        key: "validatedQuantity",
        label: SANTACASA_HISTORICO_PAGE.labels.statsValidatedQuantity,
        value: validatedQuantity || getTotalQuantity(items),
        variant: "success",
      }),
    ],
  };
}

function getRejectedStats(items) {
  const rejectedItems = getItemsCountByStatus(items, ["REJEITADO"]);

  return {
    variant: "danger",
    stats: [
      createStat({
        key: "rejectedItems",
        label: SANTACASA_HISTORICO_PAGE.labels.statsRejected,
        value: rejectedItems || items.length,
        variant: "danger",
      }),
      createStat({
        key: "releasedQuantity",
        label: SANTACASA_HISTORICO_PAGE.labels.statsReleasedQuantity,
        value: getTotalQuantity(items),
        variant: "danger",
      }),
    ],
  };
}

function getCancelledStats(items) {
  const cancelledItems = getItemsCountByStatus(items, [
    "CANCELADO",
    "CANCELADO_POR_EXPIRACAO",
  ]);

  const expiredItems = getItemsCountByStatus(items, [
    "CANCELADO_POR_EXPIRACAO",
  ]);

  const stats = [
    createStat({
      key: "cancelledItems",
      label: SANTACASA_HISTORICO_PAGE.labels.statsCanceled,
      value: cancelledItems || items.length,
      variant: "danger",
    }),
    createStat({
      key: "releasedQuantity",
      label: SANTACASA_HISTORICO_PAGE.labels.statsReleasedQuantity,
      value: getTotalQuantity(items),
      variant: "danger",
    }),
  ];

  if (expiredItems > 0) {
    stats.splice(
      1,
      0,
      createStat({
        key: "expiredItems",
        label: SANTACASA_HISTORICO_PAGE.labels.statsCanceledByExpiry,
        value: expiredItems,
        variant: "warning",
      }),
    );
  }

  return {
    variant: "danger",
    stats,
  };
}

function getFallbackStats(items) {
  return {
    variant: "neutral",
    stats: [
      createStat({
        key: "totalItems",
        label: SANTACASA_HISTORICO_PAGE.labels.totalItems,
        value: items.length,
      }),
      createStat({
        key: "totalQuantity",
        label: SANTACASA_HISTORICO_PAGE.labels.totalQuantity,
        value: getTotalQuantity(items),
      }),
    ],
  };
}

export function getHistoricoPedidoCardStats(pedido) {
  const items = getHistoricoPedidoItems(pedido);

  if (items.length === 0) {
    return {
      variant: "neutral",
      stats: [],
    };
  }

  const status = getPedidoStatus(pedido);

  if (status === "VALIDADO") {
    return getValidatedStats(items, pedido);
  }

  if (status === "REJEITADO") {
    return getRejectedStats(items);
  }

  if (status === "CANCELADO") {
    return getCancelledStats(items);
  }

  return getFallbackStats(items);
}
