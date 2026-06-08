// src/features/farmacia/shared/pedidos/components/FarmaciaPedidoSummary/FarmaciaPedidoSummary.jsx
import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import {
  getPedidoItemsCount,
  getPedidoTotalQuantity,
  getPedidoUtentesCount,
} from "../../utils/farmaciaPedido.utils";

import styles from "./FarmaciaPedidoSummary.module.css";

export default function FarmaciaPedidoSummary({
  pedido,
  dateLabel,
  dateValue,
  auditInfo = null,
}) {
  if (!pedido) return null;

  return (
    <dl className={styles.summary}>
      <div className={`${styles.summaryItem} ${styles.dateItem}`}>
        <dt>{dateLabel}</dt>
        <dd>{dateValue}</dd>
      </div>

      <div className={styles.summaryItem}>
        <dt>{FARMACIA_PEDIDO_UI.labels.totalUtentes}</dt>
        <dd>{getPedidoUtentesCount(pedido)}</dd>
      </div>

      <div className={styles.summaryItem}>
        <dt>{FARMACIA_PEDIDO_UI.labels.totalItems}</dt>
        <dd>{getPedidoItemsCount(pedido)}</dd>
      </div>

      <div className={styles.summaryItem}>
        <dt>{FARMACIA_PEDIDO_UI.labels.totalQuantity}</dt>
        <dd>{getPedidoTotalQuantity(pedido)}</dd>
      </div>

      {auditInfo ? (
        <div className={styles.summaryItem}>
          <dt>{auditInfo.label}</dt>
          <dd>{auditInfo.value}</dd>
        </div>
      ) : null}
    </dl>
  );
}
