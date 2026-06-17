// src/features/santacasa/extras/components/ExtrasList/ExtraRow.jsx
import { EXTRAS_PAGE } from "../../config/extrasPage.config";

import ExtraActionsCell from "./ExtraActionsCell";
import ExtraQuantitySummary from "./ExtraQuantitySummary";

import {
  buildPedidoItem,
  formatCreatedAt,
  getExtraPendingQuantity,
  getInputQuantity,
} from "../../utils/extrasList.utils";

import styles from "./ExtraRow.module.css";

export default function ExtraRow({
  item,
  deletingItemId,
  pedidoQuantities,
  pedidoItemsQuantities,
  hasPedidoActions,
  hasDeleteActions,
  onPedidoQuantityChange,
  onAddToPedido,
  onBlockedDelete,
  onDelete,
}) {
  const pedidoItem = buildPedidoItem(item);

  const quantidadeReservadaPendente = getExtraPendingQuantity(item);
  const quantidadeEmPedidoLocal =
    Number(pedidoItemsQuantities[pedidoItem.key]) || 0;

  const quantidadeEmPedido =
    quantidadeReservadaPendente + quantidadeEmPedidoLocal;

  const quantidadeDisponivel = Math.max(
    0,
    pedidoItem.quantidadeRestante - quantidadeEmPedidoLocal,
  );

  const quantity = getInputQuantity(
    pedidoQuantities[pedidoItem.key],
    quantidadeDisponivel,
  );

  const isDeleting = deletingItemId === item.id;
  const isPedidoDisabled = quantidadeDisponivel <= 0;

  const titleId = `extra-title-${item.id}`;

  return (
    <article className={styles.row} role="listitem" aria-labelledby={titleId}>
      <div className={styles.compactContent}>
        <div className={styles.medicationCell}>
          <span>{EXTRAS_PAGE.list.columns.medicamento}</span>
          <strong id={titleId}>{item.medicamento}</strong>
        </div>

        <ExtraQuantitySummary
          item={item}
          quantidadeDisponivel={quantidadeDisponivel}
          quantidadeEmPedido={quantidadeEmPedido}
        />

        <div className={styles.metaCell}>
          <div className={styles.createdBox}>
            <span>{EXTRAS_PAGE.list.columns.criadoEm}</span>
            <strong>{formatCreatedAt(item.createdAt)}</strong>
          </div>
        </div>

        <ExtraActionsCell
          item={item}
          pedidoItem={pedidoItem}
          quantity={quantity}
          quantidadeDisponivel={quantidadeDisponivel}
          quantidadeEmPedido={quantidadeEmPedido}
          isPedidoDisabled={isPedidoDisabled}
          isDeleting={isDeleting}
          deletingItemId={deletingItemId}
          hasPedidoActions={hasPedidoActions}
          hasDeleteActions={hasDeleteActions}
          onPedidoQuantityChange={onPedidoQuantityChange}
          onAddToPedido={onAddToPedido}
          onBlockedDelete={onBlockedDelete}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
