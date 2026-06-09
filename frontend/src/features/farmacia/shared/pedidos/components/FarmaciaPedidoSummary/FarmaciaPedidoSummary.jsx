// src/features/farmacia/shared/pedidos/components/FarmaciaPedidoSummary/FarmaciaPedidoSummary.jsx
import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import { buildPedidoOperationalSummary } from "../../utils/farmaciaPedidoOperational.utils";

import { getPedidoUtentesCount } from "../../utils/farmaciaPedido.utils";

import styles from "./FarmaciaPedidoSummary.module.css";

function getPedidoStatus(pedido) {
  return String(pedido?.status || "")
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
    label: FARMACIA_PEDIDO_UI.labels.totalUtentes,
    value: getPedidoUtentesCount(pedido),
  };
}

function buildAuditItem(auditInfo) {
  if (!auditInfo) return null;

  return {
    key: "audit",
    label: auditInfo.label,
    value: auditInfo.value,
  };
}

function buildDefaultItems(summary) {
  return [
    {
      key: "total-items",
      label: FARMACIA_PEDIDO_UI.labels.totalItems,
      value: summary.totalItems,
    },
    {
      key: "total-quantity",
      label: FARMACIA_PEDIDO_UI.labels.totalQuantity,
      value: summary.totalQuantity,
    },
  ];
}

function buildCompactWarningItems(summary) {
  return [
    {
      key: "total-items",
      label: FARMACIA_PEDIDO_UI.labels.totalItems,
      value: summary.totalItems,
    },
    {
      key: "expired-items",
      label: FARMACIA_PEDIDO_UI.summary.expiredItems,
      value: summary.expiredItems,
      tone: "danger",
    },
    {
      key: "total-quantity",
      label: FARMACIA_PEDIDO_UI.labels.totalQuantity,
      value: summary.totalQuantity,
    },
  ];
}

function buildPendingWarningItems(summary) {
  return [
    {
      key: "total-items",
      label: FARMACIA_PEDIDO_UI.labels.totalItems,
      value: summary.totalItems,
    },
    {
      key: "validatable-items",
      label: FARMACIA_PEDIDO_UI.summary.validatableItems,
      value: summary.validatableItems,
      tone: "success",
    },
    {
      key: "expired-items",
      label: FARMACIA_PEDIDO_UI.summary.expiredItems,
      value: summary.expiredItems,
      tone: "danger",
    },
    {
      key: "validatable-quantity",
      label: FARMACIA_PEDIDO_UI.summary.validatableQuantity,
      value: summary.validatableQuantity,
      tone: "success",
    },
    {
      key: "canceled-quantity",
      label: FARMACIA_PEDIDO_UI.summary.canceledQuantity,
      value: summary.expiredQuantity,
      tone: "danger",
    },
  ];
}

function buildValidatedWarningItems(summary) {
  return [
    {
      key: "total-items",
      label: FARMACIA_PEDIDO_UI.labels.totalItems,
      value: summary.totalItems,
    },
    {
      key: "validated-items",
      label: FARMACIA_PEDIDO_UI.summary.validatedItems,
      value: summary.validatedItems,
      tone: "success",
    },
    {
      key: "expired-items",
      label: FARMACIA_PEDIDO_UI.summary.expiredItems,
      value: summary.expiredItems,
      tone: "danger",
    },
    {
      key: "validated-quantity",
      label: FARMACIA_PEDIDO_UI.summary.validatedQuantity,
      value: summary.validatedQuantity,
      tone: "success",
    },
    {
      key: "not-validated-quantity",
      label: FARMACIA_PEDIDO_UI.summary.notValidatedQuantity,
      value: summary.expiredQuantity,
      tone: "danger",
    },
  ];
}

function buildOperationalItems({ pedido, summary, isCompact }) {
  if (!summary.hasExpiredItems) {
    return buildDefaultItems(summary);
  }

  if (isCompact) {
    return buildCompactWarningItems(summary);
  }

  const status = getPedidoStatus(pedido);

  if (status === "PENDENTE") {
    return buildPendingWarningItems(summary);
  }

  if (status === "VALIDADO") {
    return buildValidatedWarningItems(summary);
  }

  return [
    ...buildDefaultItems(summary),
    {
      key: "expired-items",
      label: FARMACIA_PEDIDO_UI.summary.expiredItems,
      value: summary.expiredItems,
      tone: "danger",
    },
  ];
}

function getSummaryLayout({ pedido, summary, isCompact, auditInfo }) {
  if (isCompact) {
    return summary.hasExpiredItems ? "compact-warning" : "compact";
  }

  if (!summary.hasExpiredItems) {
    return "default";
  }

  const status = getPedidoStatus(pedido);

  if (status === "PENDENTE") {
    return "pending-warning";
  }

  if (status === "VALIDADO" && auditInfo) {
    return "history-warning";
  }

  return "warning";
}

function buildSummaryItems({
  pedido,
  summary,
  dateLabel,
  dateValue,
  auditInfo,
  isCompact,
}) {
  const dateItem = buildDateItem({
    dateLabel,
    dateValue,
  });

  const utentesItem = buildUtentesItem(pedido);

  const auditItem = buildAuditItem(auditInfo);

  const operationalItems = buildOperationalItems({
    pedido,
    summary,
    isCompact,
  });

  const isDetailed = !isCompact && summary.hasExpiredItems;

  if (isDetailed && auditItem) {
    return [dateItem, auditItem, utentesItem, ...operationalItems];
  }

  return [
    dateItem,
    utentesItem,
    ...operationalItems,
    ...(auditItem ? [auditItem] : []),
  ];
}

export default function FarmaciaPedidoSummary({
  pedido,
  dateLabel,
  dateValue,

  operationalSummary = null,
  isCompact = false,

  auditInfo = null,
}) {
  if (!pedido) return null;

  const summary = operationalSummary ?? buildPedidoOperationalSummary(pedido);

  const layout = getSummaryLayout({
    pedido,
    summary,
    isCompact,
    auditInfo,
  });

  const items = buildSummaryItems({
    pedido,
    summary,
    dateLabel,
    dateValue,
    auditInfo,
    isCompact,
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
