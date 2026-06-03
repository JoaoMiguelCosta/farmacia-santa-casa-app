// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralValidity.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoGeralItem.module.css";

export default function PedidoGeralValidity({ validadeLabel }) {
  if (!validadeLabel) return null;

  return (
    <span className={styles.receitaValidity}>
      <strong>{PEDIDOS_PAGE.labels.validadeReceita}:</strong> {validadeLabel}
    </span>
  );
}
