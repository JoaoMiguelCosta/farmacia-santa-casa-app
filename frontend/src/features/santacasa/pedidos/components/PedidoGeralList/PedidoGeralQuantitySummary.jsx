// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralQuantitySummary.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoGeralItem.module.css";

function getRemainingQuantityClassName(quantidadeNaOrigem) {
  return [
    styles.remainingQuantity,
    quantidadeNaOrigem > 0 ? styles.remainingAvailable : styles.remainingEmpty,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function PedidoGeralQuantitySummary({
  maximoDisponivel,
  quantidadeNaOrigem,
}) {
  const remainingQuantityClassName =
    getRemainingQuantityClassName(quantidadeNaOrigem);

  return (
    <div className={styles.quantitySummary}>
      <span className={styles.availableQuantity}>
        <strong>{PEDIDOS_PAGE.labels.maxAvailable}:</strong> {maximoDisponivel}
      </span>

      <span className={remainingQuantityClassName}>
        <strong>{PEDIDOS_PAGE.labels.availableAtOrigin}:</strong>{" "}
        {quantidadeNaOrigem}
      </span>
    </div>
  );
}
