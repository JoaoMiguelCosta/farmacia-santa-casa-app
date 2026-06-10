import {
  SANTACASA_PEDIDO_STATUS,
  SANTACASA_PEDIDO_UI,
} from "../../../../config/santaCasaPedidoUi.config";

import { getSantaCasaPedidoUtentesCount } from "../../../../utils/santaCasaPedido.utils";

import { getSantaCasaPedidoOperationalSummary } from "../../../../utils/santaCasaPedidoOperational.utils";

import styles from "./SantaCasaPedidoSummary.module.css";

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function buildDateItem({ dateLabel, dateValue }) {
  return {
    key: "date",
    label: dateLabel,
    value: dateValue,
    isDate: true,
  };
}

function buildUtentesItem(pedido) {
  return {
    key: "utentes",

    label: SANTACASA_PEDIDO_UI.labels.totalUtentes,

    value: getSantaCasaPedidoUtentesCount(pedido),
  };
}

function buildDefaultItems(summary) {
  return [
    {
      key: "total-items",

      label: SANTACASA_PEDIDO_UI.labels.totalItems,

      value: summary.totalItems,
    },
    {
      key: "total-quantity",

      label: SANTACASA_PEDIDO_UI.labels.totalQuantity,

      value: summary.totalQuantity,
    },
  ];
}

function buildPendingWarningItems(summary) {
  return [
    {
      key: "total-items",

      label: SANTACASA_PEDIDO_UI.labels.totalItems,

      value: summary.totalItems,
    },
    {
      key: "pending-items",

      label: SANTACASA_PEDIDO_UI.summary.pendingItems,

      value: summary.pendingItems,
      tone: "success",
    },
    {
      key: "expired-items",

      label: SANTACASA_PEDIDO_UI.summary.expiredItems,

      value: summary.expiredItems,
      tone: "danger",
    },
    {
      key: "pending-quantity",

      label: SANTACASA_PEDIDO_UI.summary.pendingQuantity,

      value: summary.pendingQuantity,
      tone: "success",
    },
    {
      key: "expired-quantity",

      label: SANTACASA_PEDIDO_UI.summary.expiredQuantity,

      value: summary.expiredQuantity,
      tone: "danger",
    },
  ];
}

function buildValidatedWarningItems(summary) {
  return [
    {
      key: "total-items",

      label: SANTACASA_PEDIDO_UI.labels.totalItems,

      value: summary.totalItems,
    },
    {
      key: "validated-items",

      label: SANTACASA_PEDIDO_UI.summary.validatedItems,

      value: summary.validatedItems,
      tone: "success",
    },
    {
      key: "expired-items",

      label: SANTACASA_PEDIDO_UI.summary.expiredItems,

      value: summary.expiredItems,
      tone: "danger",
    },
    {
      key: "validated-quantity",

      label: SANTACASA_PEDIDO_UI.summary.validatedQuantity,

      value: summary.validatedQuantity,
      tone: "success",
    },
    {
      key: "expired-quantity",

      label: SANTACASA_PEDIDO_UI.summary.expiredQuantity,

      value: summary.expiredQuantity,
      tone: "danger",
    },
  ];
}

function buildOperationalItems({ pedido, summary }) {
  if (!summary.hasExpiredItems) {
    return buildDefaultItems(summary);
  }

  const status = normalizeStatus(pedido?.status);

  if (status === SANTACASA_PEDIDO_STATUS.pending) {
    return buildPendingWarningItems(summary);
  }

  if (status === SANTACASA_PEDIDO_STATUS.validated) {
    return buildValidatedWarningItems(summary);
  }

  return [
    ...buildDefaultItems(summary),

    {
      key: "expired-items",

      label: SANTACASA_PEDIDO_UI.summary.expiredItems,

      value: summary.expiredItems,
      tone: "danger",
    },
  ];
}

function getSummaryLayout({ pedido, summary }) {
  if (!summary.hasExpiredItems) {
    return "default";
  }

  const status = normalizeStatus(pedido?.status);

  if (status === SANTACASA_PEDIDO_STATUS.pending) {
    return "pending-warning";
  }

  if (status === SANTACASA_PEDIDO_STATUS.validated) {
    return "validated-warning";
  }

  return "warning";
}

export default function SantaCasaPedidoSummary({
  pedido,
  dateLabel,
  dateValue,
  operationalSummary = null,
}) {
  if (!pedido) {
    return null;
  }

  const summary =
    operationalSummary ?? getSantaCasaPedidoOperationalSummary(pedido);

  const items = [
    buildDateItem({
      dateLabel,
      dateValue,
    }),

    buildUtentesItem(pedido),

    ...buildOperationalItems({
      pedido,
      summary,
    }),
  ];

  const layout = getSummaryLayout({
    pedido,
    summary,
  });

  return (
    <dl
      className={styles.summary}
      data-layout={layout}
      data-has-warning={summary.hasExpiredItems ? "true" : "false"}
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={[styles.summaryItem, item.isDate ? styles.dateItem : ""]
            .filter(Boolean)
            .join(" ")}
          data-slot={item.key}
          data-tone={item.tone || "default"}
        >
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
