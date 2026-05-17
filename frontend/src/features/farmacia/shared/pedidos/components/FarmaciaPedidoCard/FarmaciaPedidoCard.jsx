import { useState } from "react";

import styles from "./FarmaciaPedidoCard.module.css";

import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import {
  getPedidoClosedAtLabel,
  getPedidoClosedReasonLabel,
  getPedidoClosedReasonTitle,
  getPedidoCreatedAtLabel,
  getPedidoItemMedicamentoLabel,
  getPedidoItemMetaLabel,
  getPedidoItemQuantityLabel,
  getPedidoItemReferenceLabel,
  getPedidoItemStatusLabel,
  getPedidoItemTypeLabel,
  getPedidoItemUtenteLabel,
  getPedidoItems,
  getPedidoItemsCount,
  getPedidoNumberLabel,
  getPedidoStatusLabel,
  getPedidoTotalQuantity,
  getPedidoUtentesLabel,
  hasPedidoClosedReason,
  isPedidoPending,
} from "../../utils/farmaciaPedido.utils";

function FarmaciaPedidoItem({ item }) {
  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <div className={styles.itemHeader}>
          <span className={styles.itemType}>
            {getPedidoItemTypeLabel(item.tipo)}
          </span>

          <span className={styles.itemStatus}>
            {getPedidoItemStatusLabel(item.status)}
          </span>
        </div>

        <strong className={styles.itemTitle}>
          {getPedidoItemMedicamentoLabel(item)}
        </strong>

        <span className={styles.itemReference}>
          {getPedidoItemReferenceLabel(item)}
        </span>

        <span className={styles.itemMeta}>{getPedidoItemMetaLabel(item)}</span>
      </div>

      <div className={styles.itemSide}>
        <span className={styles.itemQuantityLabel}>
          {FARMACIA_PEDIDO_UI.labels.quantidade}
        </span>

        <strong className={styles.itemQuantity}>
          {getPedidoItemQuantityLabel(item)}
        </strong>
      </div>

      <div className={styles.itemFooter}>
        <span>{FARMACIA_PEDIDO_UI.labels.utente}</span>
        <strong>{getPedidoItemUtenteLabel(item)}</strong>
      </div>
    </li>
  );
}

export default function FarmaciaPedidoCard({
  pedido,
  variant = "pending",
  showActions = true,
  isValidating = false,
  isRejecting = false,
  isActionDisabled = false,
  onValidate,
  onReject,
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!pedido) return null;

  const isHistory = variant === "history";
  const items = getPedidoItems(pedido);
  const canAct = isPedidoPending(pedido) && !isActionDisabled;

  const dateLabel = isHistory
    ? FARMACIA_PEDIDO_UI.labels.closedAt
    : FARMACIA_PEDIDO_UI.labels.createdAt;

  const dateValue = isHistory
    ? getPedidoClosedAtLabel(pedido)
    : getPedidoCreatedAtLabel(pedido);

  function handleToggleDetails() {
    setIsDetailsOpen((currentValue) => !currentValue);
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {FARMACIA_PEDIDO_UI.labels.pedido}
          </span>

          <h3 className={styles.title}>{getPedidoNumberLabel(pedido)}</h3>
        </div>

        <span className={styles.status}>
          {getPedidoStatusLabel(pedido.status)}
        </span>
      </header>

      <dl className={styles.summary}>
        <div className={styles.summaryItem}>
          <dt>{dateLabel}</dt>
          <dd>{dateValue}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_PEDIDO_UI.labels.utente}</dt>
          <dd>{getPedidoUtentesLabel(pedido)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_PEDIDO_UI.labels.totalItems}</dt>
          <dd>{getPedidoItemsCount(pedido)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_PEDIDO_UI.labels.quantidade}</dt>
          <dd>{getPedidoTotalQuantity(pedido)}</dd>
        </div>
      </dl>

      {hasPedidoClosedReason(pedido) ? (
        <div className={styles.closedReason}>
          <span>{getPedidoClosedReasonTitle(pedido)}</span>
          <strong>{getPedidoClosedReasonLabel(pedido)}</strong>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryAction}
          onClick={handleToggleDetails}
        >
          {isDetailsOpen
            ? FARMACIA_PEDIDO_UI.actions.hideDetails
            : FARMACIA_PEDIDO_UI.actions.viewDetails}
        </button>

        {showActions ? (
          <div className={styles.primaryActions}>
            <button
              type="button"
              className={styles.rejectAction}
              disabled={!canAct || isRejecting}
              onClick={() => onReject?.(pedido)}
            >
              {isRejecting
                ? FARMACIA_PEDIDO_UI.actions.rejecting
                : FARMACIA_PEDIDO_UI.actions.reject}
            </button>

            <button
              type="button"
              className={styles.validateAction}
              disabled={!canAct || isValidating}
              onClick={() => onValidate?.(pedido)}
            >
              {isValidating
                ? FARMACIA_PEDIDO_UI.actions.validating
                : FARMACIA_PEDIDO_UI.actions.validate}
            </button>
          </div>
        ) : null}
      </div>

      {isDetailsOpen ? (
        <section className={styles.details}>
          <h4 className={styles.detailsTitle}>
            {FARMACIA_PEDIDO_UI.labels.items}
          </h4>

          <ul className={styles.itemsList}>
            {items.map((item) => (
              <FarmaciaPedidoItem key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
