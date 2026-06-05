// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingCard.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingDetails from "./PedidoPendingDetails";

import { usePedidoPendingCard } from "./usePedidoPendingCard";

import styles from "./PedidoPendingCard.module.css";

function getStatusClassName(hasExpirationWarning) {
  return [styles.status, hasExpirationWarning ? styles.statusWarning : ""]
    .filter(Boolean)
    .join(" ");
}

export default function PedidoPendingCard({
  pedido,
  isCanceling = false,
  onCancelRequest,
}) {
  const {
    detailsId,

    isDetailsOpen,
    hasExpirationWarning,

    pedidoNumberLabel,
    pedidoStatusLabel,
    createdAtLabel,
    utentesCountLabel,
    medicamentosCountLabel,
    pendingMedicamentosCountLabel,
    canceledMedicamentosCountLabel,
    totalQuantityLabel,
    pendingQuantityLabel,
    expirationWarningsLabel,
    toggleLabel,

    handleToggleDetails,
  } = usePedidoPendingCard(pedido);

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.identity}>
          <span>{PEDIDOS_PAGE.labels.pedido}</span>
          <h3>{pedidoNumberLabel}</h3>
        </div>

        <span className={getStatusClassName(hasExpirationWarning)}>
          {pedidoStatusLabel}
        </span>
      </header>

      <dl className={styles.summary}>
        <div>
          <dt>{PEDIDOS_PAGE.labels.createdAt}</dt>
          <dd>{createdAtLabel}</dd>
        </div>

        <div>
          <dt>{PEDIDOS_PAGE.labels.utentes}</dt>
          <dd>{utentesCountLabel}</dd>
        </div>

        <div>
          <dt>{PEDIDOS_PAGE.labels.items}</dt>
          <dd>{medicamentosCountLabel}</dd>
        </div>

        {hasExpirationWarning ? (
          <>
            <div>
              <dt>{PEDIDOS_PAGE.labels.pendingItems}</dt>
              <dd>{pendingMedicamentosCountLabel}</dd>
            </div>

            <div>
              <dt>{PEDIDOS_PAGE.labels.canceledItems}</dt>
              <dd>{canceledMedicamentosCountLabel}</dd>
            </div>

            <div>
              <dt>{PEDIDOS_PAGE.labels.pendingQuantity}</dt>
              <dd>{pendingQuantityLabel}</dd>
            </div>
          </>
        ) : (
          <div>
            <dt>{PEDIDOS_PAGE.labels.totalQuantity}</dt>
            <dd>{totalQuantityLabel}</dd>
          </div>
        )}
      </dl>

      {hasExpirationWarning ? (
        <aside className={styles.warning} role="status">
          <strong>{PEDIDOS_PAGE.sections.pending.expirationWarningTitle}</strong>
          <p>{PEDIDOS_PAGE.sections.pending.expirationWarningDescription}</p>
          <span>{expirationWarningsLabel}</span>
        </aside>
      ) : null}

      {isDetailsOpen ? (
        <PedidoPendingDetails id={detailsId} pedido={pedido} />
      ) : null}

      <footer className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-expanded={isDetailsOpen}
          aria-controls={detailsId}
          onClick={handleToggleDetails}
        >
          {toggleLabel}
        </Button>

        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={isCanceling}
          onClick={() => onCancelRequest?.(pedido)}
        >
          {PEDIDOS_PAGE.actions.cancelPedido}
        </Button>
      </footer>
    </article>
  );
}
