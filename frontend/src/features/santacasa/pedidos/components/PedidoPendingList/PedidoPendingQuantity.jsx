// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingQuantity.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoPendingItem.module.css";

export default function PedidoPendingQuantity({ quantidade }) {
  return (
    <span className={styles.itemQuantity}>
      {PEDIDOS_PAGE.labels.quantityShort} {Number(quantidade) || 0}
    </span>
  );
}
