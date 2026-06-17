// src/features/santacasa/shared/pedidos/components/SantaCasaPedidoCard/SantaCasaPedidoCard.jsx
import { SANTACASA_PEDIDO_UI } from "../../config/santaCasaPedidoUi.config";

import SantaCasaPedidoSummary from "./components/SantaCasaPedidoSummary/SantaCasaPedidoSummary";

import { useSantaCasaPedidoCard } from "./useSantaCasaPedidoCard";

import styles from "./SantaCasaPedidoCard.module.css";

function getSafeDomIdFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-");
}

export default function SantaCasaPedidoCard({ pedido }) {
  const {
    pedidoNumberLabel,

    operationalSummary,
    visualStatus,
    warning,

    dateLabel,
    dateValue,
  } = useSantaCasaPedidoCard(pedido);

  if (!pedido) {
    return null;
  }

  const safePedidoId = getSafeDomIdFragment(pedido.id);

  const cardTitleId = `santacasa-pedido-${safePedidoId}-title`;

  return (
    <article
      className={styles.card}
      data-status={visualStatus.status}
      data-has-warning={visualStatus.hasWarning ? "true" : "false"}
      aria-labelledby={cardTitleId}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {SANTACASA_PEDIDO_UI.labels.pedido}
          </span>

          <div className={styles.titleRow}>
            <h2 id={cardTitleId} className={styles.title}>
              {pedidoNumberLabel}
            </h2>

            <span
              className={styles.status}
              data-status={visualStatus.status}
              data-warning={visualStatus.hasWarning ? "true" : "false"}
            >
              {visualStatus.label}
            </span>
          </div>
        </div>
      </header>

      {warning ? (
        <aside className={styles.warning} aria-label={warning.title}>
          <span className={styles.warningIcon} aria-hidden="true">
            !
          </span>

          <div className={styles.warningContent}>
            <strong className={styles.warningTitle}>{warning.title}</strong>

            <p className={styles.warningMessage}>{warning.message}</p>
          </div>
        </aside>
      ) : null}

      <SantaCasaPedidoSummary
        pedido={pedido}
        operationalSummary={operationalSummary}
        dateLabel={dateLabel}
        dateValue={dateValue}
      />
    </article>
  );
}
