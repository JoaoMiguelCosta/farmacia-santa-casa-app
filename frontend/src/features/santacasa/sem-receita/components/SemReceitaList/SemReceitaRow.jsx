// src/features/santacasa/sem-receita/components/SemReceitaList/SemReceitaRow.jsx
import { SEM_RECEITA_PAGE } from "../../config/semReceitaPage.config";

import SemReceitaActionsCell from "./SemReceitaActionsCell";
import SemReceitaQuantitySummary from "./SemReceitaQuantitySummary";

import {
  buildPedidoItem,
  formatCreatedAt,
  getInputQuantity,
  getSemReceitaPendingQuantity,
} from "../../utils/semReceitaList.utils";

import styles from "./SemReceitaRow.module.css";

export default function SemReceitaRow({
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

  const quantidadeReservadaPendente = getSemReceitaPendingQuantity(item);
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

  const titleId = `sem-receita-title-${item.id}`;

  return (
    <article className={styles.row} role="listitem" aria-labelledby={titleId}>
      <div className={styles.compactContent}>
        <div className={styles.medicationCell}>
          <span>{SEM_RECEITA_PAGE.list.columns.medicamento}</span>
          <strong id={titleId}>{item.medicamento}</strong>
        </div>

        <SemReceitaQuantitySummary
          item={item}
          quantidadeDisponivel={quantidadeDisponivel}
          quantidadeEmPedido={quantidadeEmPedido}
        />

        <div className={styles.metaCell}>
          <div className={styles.createdBox}>
            <span>{SEM_RECEITA_PAGE.list.columns.criadoEm}</span>
            <strong>{formatCreatedAt(item.createdAt)}</strong>
          </div>
        </div>

        <SemReceitaActionsCell
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
