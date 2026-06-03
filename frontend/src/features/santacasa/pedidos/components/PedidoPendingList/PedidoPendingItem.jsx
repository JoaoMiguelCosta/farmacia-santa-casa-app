// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingItem.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingQuantity from "./PedidoPendingQuantity";
import PedidoPendingReceitaBarcodes from "./PedidoPendingReceitaBarcodes";
import PedidoPendingTypeBadge from "./PedidoPendingTypeBadge";
import PedidoPendingValidity from "./PedidoPendingValidity";

import {
  getPedidoItemReceita,
  getReceitaValidityLabel,
} from "./pedidoPendingList.utils";

import styles from "./PedidoPendingItem.module.css";

export default function PedidoPendingItem({ item }) {
  if (!item) return null;

  const receita = getPedidoItemReceita(item);
  const validadeLabel = getReceitaValidityLabel(receita);

  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <PedidoPendingTypeBadge tipo={item.tipo} />

        <strong>
          {item.medicamento || PEDIDOS_PAGE.labels.medicamentoFallback}
        </strong>

        <PedidoPendingValidity validadeLabel={validadeLabel} />

        <PedidoPendingReceitaBarcodes receita={receita} />
      </div>

      <PedidoPendingQuantity quantidade={item.quantidade} />
    </li>
  );
}
