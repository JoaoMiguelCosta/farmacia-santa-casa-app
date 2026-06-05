// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingQuantity.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoPendingItem.module.css";

function getQuantityClassName(isCanceled) {
  return [styles.itemQuantity, isCanceled ? styles.itemQuantityCanceled : ""]
    .filter(Boolean)
    .join(" ");
}

export default function PedidoPendingQuantity({
  quantidade,
  isCanceled = false,
}) {
  return (
    <span className={getQuantityClassName(isCanceled)}>
      {PEDIDOS_PAGE.labels.quantityShort} {Number(quantidade) || 0}
    </span>
  );
}
