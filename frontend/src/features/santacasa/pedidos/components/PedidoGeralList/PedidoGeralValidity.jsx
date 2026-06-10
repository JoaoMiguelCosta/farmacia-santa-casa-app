// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralValidity.jsx

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import styles from "./PedidoGeralItem.module.css";

export default function PedidoGeralValidity({ validadeLabel }) {
  if (!validadeLabel) {
    return null;
  }

  return (
    <div className={styles.validade}>
      <span>{PEDIDOS_PAGE.labels.validadeReceita}</span>

      <strong>{validadeLabel}</strong>
    </div>
  );
}
