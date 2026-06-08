// src/features/farmacia/shared/pedidos/components/FarmaciaPedidoActions/FarmaciaPedidoActions.jsx
import { Link } from "react-router-dom";

import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import styles from "./FarmaciaPedidoActions.module.css";

export default function FarmaciaPedidoActions({ detailsTo = null }) {
  if (!detailsTo) return null;

  return (
    <div className={styles.actions}>
      <Link className={styles.openAction} to={detailsTo}>
        {FARMACIA_PEDIDO_UI.actions.openPedido}
      </Link>
    </div>
  );
}
