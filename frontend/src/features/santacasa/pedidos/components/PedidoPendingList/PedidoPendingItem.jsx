// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingItem.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingReceitaBarcodes from "./PedidoPendingReceitaBarcodes";

import {
  getPedidoItemReceita,
  getReceitaValidityLabel,
  getTypeLabel,
} from "./pedidoPendingList.utils";

import styles from "./PedidoPendingList.module.css";

function getTypeClassName(tipo) {
  if (tipo === "COM_RECEITA") return styles.receita;
  if (tipo === "SEM_RECEITA") return styles.semReceita;
  if (tipo === "EXTRA") return styles.extra;

  return styles.defaultType;
}

export default function PedidoPendingItem({ item }) {
  if (!item) return null;

  const receita = getPedidoItemReceita(item);
  const validadeLabel = getReceitaValidityLabel(receita);

  const typeClassName = [styles.itemType, getTypeClassName(item.tipo)]
    .filter(Boolean)
    .join(" ");

  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <span className={typeClassName}>{getTypeLabel(item.tipo)}</span>

        <strong>
          {item.medicamento || PEDIDOS_PAGE.labels.medicamentoFallback}
        </strong>

        {validadeLabel ? (
          <span className={styles.receitaValidity}>
            <strong>{PEDIDOS_PAGE.labels.validadeReceita}:</strong>{" "}
            {validadeLabel}
          </span>
        ) : null}

        <PedidoPendingReceitaBarcodes receita={receita} />
      </div>

      <span className={styles.itemQuantity}>
        {PEDIDOS_PAGE.labels.quantityShort} {Number(item.quantidade) || 0}
      </span>
    </li>
  );
}
