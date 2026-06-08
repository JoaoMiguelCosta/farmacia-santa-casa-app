// src/features/farmacia/shared/pedidos/components/FarmaciaPedidoCard/FarmaciaPedidoCard.jsx
import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import { useFarmaciaPedidoCard } from "../../hooks/useFarmaciaPedidoCard";

import {
  getPedidoClosedReasonLabel,
  getPedidoClosedReasonTitle,
  getPedidoNumberLabel,
  getPedidoStatusLabel,
  hasPedidoClosedReason,
} from "../../utils/farmaciaPedido.utils";

import FarmaciaPedidoActions from "../FarmaciaPedidoActions/FarmaciaPedidoActions";
import FarmaciaPedidoSummary from "../FarmaciaPedidoSummary/FarmaciaPedidoSummary";
import FarmaciaPedidoUtentesList from "../FarmaciaPedidoUtentesList/FarmaciaPedidoUtentesList";

import styles from "./FarmaciaPedidoCard.module.css";

function normalizeDataValue(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

export default function FarmaciaPedidoCard({
  pedido,
  variant = "pending",
  detailsTo = null,
  showUtentes = true,
}) {
  const { utenteGroups, auditInfo, dateLabel, dateValue } =
    useFarmaciaPedidoCard({
      pedido,
      variant,
    });

  if (!pedido) return null;

  const pedidoStatus = normalizeDataValue(pedido.status);
  const cardTitleId = `farmacia-pedido-${pedido.id}-title`;

  return (
    <article
      className={styles.card}
      data-status={pedidoStatus}
      data-compact={showUtentes ? "false" : "true"}
      aria-labelledby={cardTitleId}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {FARMACIA_PEDIDO_UI.labels.pedido}
          </span>

          <div className={styles.titleRow}>
            <h3 id={cardTitleId} className={styles.title}>
              {getPedidoNumberLabel(pedido)}
            </h3>

            <span className={styles.status} data-status={pedidoStatus}>
              {getPedidoStatusLabel(pedido.status)}
            </span>
          </div>
        </div>
      </header>

      <FarmaciaPedidoSummary
        pedido={pedido}
        dateLabel={dateLabel}
        dateValue={dateValue}
        auditInfo={auditInfo}
      />

      {hasPedidoClosedReason(pedido) ? (
        <div className={styles.closedReason}>
          <span>{getPedidoClosedReasonTitle(pedido)}</span>

          <strong>{getPedidoClosedReasonLabel(pedido)}</strong>
        </div>
      ) : null}

      {showUtentes ? (
        <FarmaciaPedidoUtentesList pedidoId={pedido.id} groups={utenteGroups} />
      ) : null}

      <FarmaciaPedidoActions detailsTo={detailsTo} />
    </article>
  );
}
