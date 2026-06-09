// src/features/farmacia/pedidos/components/FarmaciaPedidoDetailActionsBar/FarmaciaPedidoDetailActionsBar.jsx
import { FARMACIA_PEDIDO_UI } from "../../../shared/pedidos/config/farmaciaPedidoUi.config";

import { buildPedidoOperationalSummary } from "../../../shared/pedidos/utils/farmaciaPedidoOperational.utils";

import { getPedidoUtentesCount } from "../../../shared/pedidos/utils/farmaciaPedido.utils";

import { FARMACIA_PEDIDOS_PAGE } from "../../config/farmaciaPedidosPage.config";

import styles from "./FarmaciaPedidoDetailActionsBar.module.css";

function buildMetrics({ pedido, summary, labels }) {
  const metrics = [
    {
      key: "utentes",
      label: labels.utentes,
      value: getPedidoUtentesCount(pedido),
    },
    {
      key: "validatable-items",
      label: labels.validatableItems,
      value: summary.validatableItems,
      tone: "success",
    },
    {
      key: "validatable-quantity",
      label: labels.validatableQuantity,
      value: summary.validatableQuantity,
      tone: "success",
    },
  ];

  if (summary.hasExpiredItems) {
    metrics.push(
      {
        key: "expired-items",
        label: labels.expiredItems,
        value: summary.expiredItems,
        tone: "danger",
      },
      {
        key: "expired-quantity",
        label: labels.expiredQuantity,
        value: summary.expiredQuantity,
        tone: "danger",
      },
    );
  }

  return metrics;
}

export default function FarmaciaPedidoDetailActionsBar({
  pedido,
  isActionDisabled = false,
  isValidating = false,
  isRejecting = false,
  onValidate,
  onReject,
}) {
  if (!pedido) return null;

  const { actionBar } = FARMACIA_PEDIDOS_PAGE.detail;

  const summary = buildPedidoOperationalSummary(pedido);

  const metrics = buildMetrics({
    pedido,
    summary,
    labels: actionBar.labels,
  });

  const hasPendingItems = summary.validatableItems > 0;

  const description = summary.hasExpiredItems
    ? actionBar.warningDescription
    : actionBar.description;

  const areActionsDisabled = isActionDisabled || !hasPendingItems;

  return (
    <aside
      className={styles.bar}
      data-has-warning={summary.hasExpiredItems ? "true" : "false"}
      aria-label={actionBar.ariaLabel}
    >
      <div className={styles.content}>
        <div className={styles.heading}>
          <strong className={styles.title}>{actionBar.title}</strong>

          <span className={styles.description}>{description}</span>
        </div>

        <dl className={styles.metrics}>
          {metrics.map((metric) => (
            <div
              key={metric.key}
              className={styles.metric}
              data-tone={metric.tone || "default"}
            >
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.rejectAction}
          disabled={areActionsDisabled || isRejecting}
          onClick={() => onReject?.(pedido)}
        >
          {isRejecting
            ? FARMACIA_PEDIDO_UI.actions.rejecting
            : FARMACIA_PEDIDO_UI.actions.reject}
        </button>

        <button
          type="button"
          className={styles.validateAction}
          disabled={areActionsDisabled || isValidating}
          onClick={() => onValidate?.(pedido)}
        >
          {isValidating
            ? FARMACIA_PEDIDO_UI.actions.validating
            : FARMACIA_PEDIDO_UI.actions.validate}
        </button>
      </div>
    </aside>
  );
}
