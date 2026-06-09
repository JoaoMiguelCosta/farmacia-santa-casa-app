// src/features/farmacia/shared/pedidos/components/FarmaciaPedidoCard/FarmaciaPedidoCard.jsx
import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import { useFarmaciaPedidoCard } from "../../hooks/useFarmaciaPedidoCard";

import {
  getPedidoClosedReasonLabel,
  getPedidoClosedReasonTitle,
  getPedidoNumberLabel,
  hasPedidoClosedReason,
} from "../../utils/farmaciaPedido.utils";

import FarmaciaPedidoActions from "../FarmaciaPedidoActions/FarmaciaPedidoActions";
import FarmaciaPedidoSummary from "../FarmaciaPedidoSummary/FarmaciaPedidoSummary";
import FarmaciaPedidoUtentesList from "../FarmaciaPedidoUtentesList/FarmaciaPedidoUtentesList";
import FarmaciaPedidoWarning from "../FarmaciaPedidoWarning/FarmaciaPedidoWarning";

import styles from "./FarmaciaPedidoCard.module.css";

export default function FarmaciaPedidoCard({
  pedido,
  variant = "pending",

  detailsTo = null,
  detailsLabel = null,
  detailsNavigationState = null,

  showUtentes = true,
}) {
  const {
    utenteGroups,
    operationalSummary,
    visualStatus,
    warning,

    auditInfo,
    dateLabel,
    dateValue,
  } = useFarmaciaPedidoCard({
    pedido,
    variant,
  });

  if (!pedido) return null;

  const cardTitleId = `farmacia-pedido-${pedido.id}-title`;

  const isCompact = !showUtentes;

  return (
    <article
      className={styles.card}
      data-status={visualStatus.status}
      data-has-warning={visualStatus.hasWarning ? "true" : "false"}
      data-compact={isCompact ? "true" : "false"}
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

      <FarmaciaPedidoWarning warning={warning} isCompact={isCompact} />

      <FarmaciaPedidoSummary
        pedido={pedido}
        operationalSummary={operationalSummary}
        dateLabel={dateLabel}
        dateValue={dateValue}
        auditInfo={auditInfo}
        isCompact={isCompact}
      />

      {hasPedidoClosedReason(pedido) ? (
        <div className={styles.closedReason}>
          <span>{getPedidoClosedReasonTitle(pedido)}</span>

          <strong>{getPedidoClosedReasonLabel(pedido)}</strong>
        </div>
      ) : null}

      {showUtentes ? (
        <FarmaciaPedidoUtentesList
          pedidoId={pedido.id}
          groups={utenteGroups}
          variant={variant}
        />
      ) : null}

      <FarmaciaPedidoActions
        detailsTo={detailsTo}
        actionLabel={detailsLabel ?? FARMACIA_PEDIDO_UI.actions.openPedido}
        navigationState={detailsNavigationState}
      />
    </article>
  );
}
