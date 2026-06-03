// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingCard.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingDetails from "./PedidoPendingDetails";

import { usePedidoPendingCard } from "./usePedidoPendingCard";

import styles from "./PedidoPendingCard.module.css";

export default function PedidoPendingCard({
  pedido,
  isCanceling = false,
  onCancelRequest,
}) {
  const {
    detailsId,

    isDetailsOpen,

    pedidoNumberLabel,
    createdAtLabel,
    utentesCountLabel,
    medicamentosCountLabel,
    totalQuantityLabel,
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

        <span className={styles.status}>
          {PEDIDOS_PAGE.labels.pendingStatus}
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

        <div>
          <dt>{PEDIDOS_PAGE.labels.totalQuantity}</dt>
          <dd>{totalQuantityLabel}</dd>
        </div>
      </dl>

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
