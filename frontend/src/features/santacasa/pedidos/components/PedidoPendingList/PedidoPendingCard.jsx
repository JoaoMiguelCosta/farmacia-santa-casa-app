// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingCard.jsx
import { useState } from "react";

import Button from "../../../../../shared/ui/Button/Button";

import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingDetails from "./PedidoPendingDetails";

import {
  getMedicamentosCountLabel,
  getPedidoMedicamentosCount,
  getPedidoNumberLabel,
  getPedidoTotalQuantity,
  getPedidoUtentesCount,
  getUnidadesCountLabel,
  getUtentesCountLabel,
} from "./pedidoPendingList.utils";

import styles from "./PedidoPendingList.module.css";

function getSafeDetailsId(pedido) {
  const safePedidoId = String(pedido?.id || pedido?.numero || "sem-id").replace(
    /[^a-zA-Z0-9_-]/g,
    "-",
  );

  return `pedido-${safePedidoId}-medicamentos`;
}

export default function PedidoPendingCard({
  pedido,
  isCanceling = false,
  onCancelRequest,
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const utentesCount = getPedidoUtentesCount(pedido);
  const medicamentosCount = getPedidoMedicamentosCount(pedido);
  const totalQuantity = getPedidoTotalQuantity(pedido);
  const detailsId = getSafeDetailsId(pedido);

  const toggleLabel = isDetailsOpen
    ? PEDIDOS_PAGE.actions.hideMedicamentos
    : PEDIDOS_PAGE.actions.viewMedicamentos;

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.identity}>
          <span>{PEDIDOS_PAGE.labels.pedido}</span>
          <h3>{getPedidoNumberLabel(pedido)}</h3>
        </div>

        <span className={styles.status}>
          {PEDIDOS_PAGE.labels.pendingStatus}
        </span>
      </header>

      <dl className={styles.summary}>
        <div>
          <dt>{PEDIDOS_PAGE.labels.createdAt}</dt>
          <dd>{formatDateTime(pedido?.createdAt)}</dd>
        </div>

        <div>
          <dt>{PEDIDOS_PAGE.labels.utentes}</dt>
          <dd>{getUtentesCountLabel(utentesCount)}</dd>
        </div>

        <div>
          <dt>{PEDIDOS_PAGE.labels.items}</dt>
          <dd>{getMedicamentosCountLabel(medicamentosCount)}</dd>
        </div>

        <div>
          <dt>{PEDIDOS_PAGE.labels.totalQuantity}</dt>
          <dd>{getUnidadesCountLabel(totalQuantity)}</dd>
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
          onClick={() => setIsDetailsOpen((currentValue) => !currentValue)}
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
