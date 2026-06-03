// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingValidity.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoPendingItem.module.css";

export default function PedidoPendingValidity({ validadeLabel }) {
  if (!validadeLabel) return null;

  return (
    <span className={styles.receitaValidity}>
      <strong>{PEDIDOS_PAGE.labels.validadeReceita}:</strong> {validadeLabel}
    </span>
  );
}
