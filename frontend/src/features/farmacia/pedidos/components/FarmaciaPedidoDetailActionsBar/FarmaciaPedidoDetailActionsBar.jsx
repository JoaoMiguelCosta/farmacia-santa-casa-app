// src/features/farmacia/pedidos/components/FarmaciaPedidoDetailActionsBar/FarmaciaPedidoDetailActionsBar.jsx
import { FARMACIA_PEDIDO_UI } from "../../../shared/pedidos/config/farmaciaPedidoUi.config";

import {
  getPedidoItemsCount,
  getPedidoTotalQuantity,
  getPedidoUtentesCount,
} from "../../../shared/pedidos/utils/farmaciaPedido.utils";

import { FARMACIA_PEDIDOS_PAGE } from "../../config/farmaciaPedidosPage.config";

import styles from "./FarmaciaPedidoDetailActionsBar.module.css";

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

  return (
    <aside className={styles.bar} aria-label={actionBar.ariaLabel}>
      <div className={styles.content}>
        <div className={styles.heading}>
          <strong className={styles.title}>{actionBar.title}</strong>

          <span className={styles.description}>{actionBar.description}</span>
        </div>

        <dl className={styles.metrics}>
          <div className={styles.metric}>
            <dt>{actionBar.labels.utentes}</dt>
            <dd>{getPedidoUtentesCount(pedido)}</dd>
          </div>

          <div className={styles.metric}>
            <dt>{actionBar.labels.items}</dt>
            <dd>{getPedidoItemsCount(pedido)}</dd>
          </div>

          <div className={styles.metric}>
            <dt>{actionBar.labels.quantity}</dt>
            <dd>{getPedidoTotalQuantity(pedido)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.rejectAction}
          disabled={isActionDisabled || isRejecting}
          onClick={() => onReject?.(pedido)}
        >
          {isRejecting
            ? FARMACIA_PEDIDO_UI.actions.rejecting
            : FARMACIA_PEDIDO_UI.actions.reject}
        </button>

        <button
          type="button"
          className={styles.validateAction}
          disabled={isActionDisabled || isValidating}
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
