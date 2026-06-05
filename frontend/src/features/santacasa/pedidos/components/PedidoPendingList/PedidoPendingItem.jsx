// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingItem.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingQuantity from "./PedidoPendingQuantity";
import PedidoPendingReceitaBarcodes from "./PedidoPendingReceitaBarcodes";
import PedidoPendingTypeBadge from "./PedidoPendingTypeBadge";
import PedidoPendingValidity from "./PedidoPendingValidity";

import {
  getPedidoItemReceita,
  getReceitaValidityLabel,
  isPedidoItemCanceledByExpiration,
} from "./pedidoPendingList.utils";

import styles from "./PedidoPendingItem.module.css";

function getItemClassName(isCanceledByExpiration) {
  return [styles.item, isCanceledByExpiration ? styles.itemCanceled : ""]
    .filter(Boolean)
    .join(" ");
}

export default function PedidoPendingItem({ item }) {
  if (!item) return null;

  const receita = getPedidoItemReceita(item);
  const validadeLabel = getReceitaValidityLabel(receita);
  const isCanceledByExpiration = isPedidoItemCanceledByExpiration(item);

  return (
    <li className={getItemClassName(isCanceledByExpiration)}>
      <div className={styles.itemMain}>
        <PedidoPendingTypeBadge tipo={item.tipo} />

        <strong>
          {item.medicamento || PEDIDOS_PAGE.labels.medicamentoFallback}
        </strong>

        {isCanceledByExpiration ? (
          <div className={styles.itemWarning}>
            <span>{PEDIDOS_PAGE.labels.canceledByExpirationStatus}</span>
            <p>{PEDIDOS_PAGE.labels.expiredReceitaItemDescription}</p>
          </div>
        ) : null}

        <PedidoPendingValidity validadeLabel={validadeLabel} />

        <PedidoPendingReceitaBarcodes receita={receita} />
      </div>

      <PedidoPendingQuantity
        quantidade={item.quantidade}
        isCanceled={isCanceledByExpiration}
      />
    </li>
  );
}
