import { useState } from "react";

import styles from "./SantaCasaHistoricoCard.module.css";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoClosedAtLabel,
  getHistoricoPedidoClosedReasonLabel,
  getHistoricoPedidoClosedReasonTitle,
  getHistoricoPedidoItemMedicamentoLabel,
  getHistoricoPedidoItemMetaLabel,
  getHistoricoPedidoItemQuantityLabel,
  getHistoricoPedidoItemReferenceLabel,
  getHistoricoPedidoItemStatusLabel,
  getHistoricoPedidoItemTypeLabel,
  getHistoricoPedidoItemUtenteLabel,
  getHistoricoPedidoItems,
  getHistoricoPedidoItemsCount,
  getHistoricoPedidoMessage,
  getHistoricoPedidoNumberLabel,
  getHistoricoPedidoStatusLabel,
  getHistoricoPedidoTotalQuantity,
  getHistoricoPedidoUtentesLabel,
  shouldShowHistoricoPedidoReason,
} from "../../utils/santaCasaHistorico.utils";

function SantaCasaHistoricoItem({ item }) {
  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <div className={styles.itemHeader}>
          <span className={styles.itemType}>
            {getHistoricoPedidoItemTypeLabel(item.tipo)}
          </span>

          <span className={styles.itemStatus}>
            {getHistoricoPedidoItemStatusLabel(item.status)}
          </span>
        </div>

        <strong className={styles.itemTitle}>
          {getHistoricoPedidoItemMedicamentoLabel(item)}
        </strong>

        <span className={styles.itemReference}>
          {getHistoricoPedidoItemReferenceLabel(item)}
        </span>

        <span className={styles.itemMeta}>
          {getHistoricoPedidoItemMetaLabel(item)}
        </span>
      </div>

      <div className={styles.itemSide}>
        <span>{SANTACASA_HISTORICO_PAGE.labels.quantidade}</span>
        <strong>{getHistoricoPedidoItemQuantityLabel(item)}</strong>
      </div>

      <div className={styles.itemFooter}>
        <span>{SANTACASA_HISTORICO_PAGE.labels.utente}</span>
        <strong>{getHistoricoPedidoItemUtenteLabel(item)}</strong>
      </div>
    </li>
  );
}

export default function SantaCasaHistoricoCard({ pedido }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!pedido) return null;

  const items = getHistoricoPedidoItems(pedido);
  const message = getHistoricoPedidoMessage(pedido);
  const showReason = shouldShowHistoricoPedidoReason(pedido);

  function handleToggleDetails() {
    setIsDetailsOpen((currentValue) => !currentValue);
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {SANTACASA_HISTORICO_PAGE.labels.pedido}
          </span>

          <h3 className={styles.title}>
            {getHistoricoPedidoNumberLabel(pedido)}
          </h3>
        </div>

        <span className={styles.status}>
          {getHistoricoPedidoStatusLabel(pedido.status)}
        </span>
      </header>

      {message ? <p className={styles.message}>{message}</p> : null}

      <dl className={styles.summary}>
        <div className={styles.summaryItem}>
          <dt>{SANTACASA_HISTORICO_PAGE.labels.closedAt}</dt>
          <dd>{getHistoricoPedidoClosedAtLabel(pedido)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_HISTORICO_PAGE.labels.utente}</dt>
          <dd>{getHistoricoPedidoUtentesLabel(pedido)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_HISTORICO_PAGE.labels.totalItems}</dt>
          <dd>{getHistoricoPedidoItemsCount(pedido)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_HISTORICO_PAGE.labels.totalQuantity}</dt>
          <dd>{getHistoricoPedidoTotalQuantity(pedido)}</dd>
        </div>
      </dl>

      {showReason ? (
        <div className={styles.reason}>
          <span>{getHistoricoPedidoClosedReasonTitle(pedido)}</span>
          <strong>{getHistoricoPedidoClosedReasonLabel(pedido)}</strong>
        </div>
      ) : null}

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.detailsButton}
          onClick={handleToggleDetails}
        >
          {isDetailsOpen
            ? SANTACASA_HISTORICO_PAGE.actions.hideDetails
            : SANTACASA_HISTORICO_PAGE.actions.viewDetails}
        </button>
      </footer>

      {isDetailsOpen ? (
        <section className={styles.details}>
          <h4 className={styles.detailsTitle}>
            {SANTACASA_HISTORICO_PAGE.labels.items}
          </h4>

          <ul className={styles.itemsList}>
            {items.map((item) => (
              <SantaCasaHistoricoItem key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
