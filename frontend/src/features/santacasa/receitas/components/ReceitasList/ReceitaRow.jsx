// src/features/santacasa/receitas/components/ReceitasList/ReceitaRow.jsx
import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import ReceitaActionsCell from "./ReceitaActionsCell";
import ReceitaCodesPanel from "./ReceitaCodesPanel";
import ReceitaQuantitySummary from "./ReceitaQuantitySummary";

import {
  buildPedidoItem,
  formatDateOnly,
  getInputQuantity,
  getReceitaPendingQuantity,
  hasEarlierAvailableReceita,
} from "../../utils/receitasList.utils";

import styles from "./ReceitaRow.module.css";

export default function ReceitaRow({
  linha,
  receitas,
  deletingLinhaId,
  pedidoQuantities,
  pedidoItemsQuantities,
  expandedLinhaId,
  hasPedidoActions,
  hasDeleteActions,
  onToggleCodes,
  onPedidoQuantityChange,
  onAddToPedido,
  onBlockedDelete,
  onDelete,
}) {
  const pedidoItem = buildPedidoItem(linha);

  const quantidadeReservadaPendente = getReceitaPendingQuantity(linha);
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

  const isDeleting = deletingLinhaId === linha.linhaId;

  const isBlockedByFefo = hasEarlierAvailableReceita({
    linha,
    receitas,
    pedidoItemsQuantities,
  });

  const isPedidoDisabled = quantidadeDisponivel <= 0 || isBlockedByFefo;
  const isCodesExpanded = expandedLinhaId === linha.linhaId;

  const titleId = `receita-title-${linha.linhaId}`;
  const codesPanelId = `receita-codes-${linha.linhaId}`;
  const fefoNoticeId = `fefo-notice-${linha.linhaId}`;

  return (
    <article
      className={
        isBlockedByFefo ? `${styles.row} ${styles.fefoBlockedRow}` : styles.row
      }
      role="listitem"
      aria-labelledby={titleId}
    >
      <div className={styles.compactContent}>
        <div className={styles.medicationCell}>
          <span>{RECEITAS_PAGE.list.columns.medicamento}</span>
          <strong id={titleId}>{linha.medicamento}</strong>

          {isBlockedByFefo ? (
            <p id={fefoNoticeId} className={styles.fefoNotice}>
              {RECEITAS_PAGE.list.fefo.blockedMessage}
            </p>
          ) : null}
        </div>

        <ReceitaQuantitySummary
          linha={linha}
          quantidadeDisponivel={quantidadeDisponivel}
          quantidadeEmPedido={quantidadeEmPedido}
        />

        <div className={styles.metaCell}>
          <div className={styles.validityBox}>
            <span>{RECEITAS_PAGE.list.columns.validade}</span>
            <strong>{formatDateOnly(linha.validade)}</strong>
          </div>

          <div className={styles.statusBox}>
            <span>{RECEITAS_PAGE.list.columns.estado}</span>
            <strong className={styles.status}>{linha.status}</strong>
          </div>
        </div>

        <ReceitaActionsCell
          linha={linha}
          pedidoItem={pedidoItem}
          quantity={quantity}
          quantidadeDisponivel={quantidadeDisponivel}
          quantidadeEmPedido={quantidadeEmPedido}
          isBlockedByFefo={isBlockedByFefo}
          isPedidoDisabled={isPedidoDisabled}
          isDeleting={isDeleting}
          deletingLinhaId={deletingLinhaId}
          isCodesExpanded={isCodesExpanded}
          codesPanelId={codesPanelId}
          fefoNoticeId={fefoNoticeId}
          hasPedidoActions={hasPedidoActions}
          hasDeleteActions={hasDeleteActions}
          onToggleCodes={onToggleCodes}
          onPedidoQuantityChange={onPedidoQuantityChange}
          onAddToPedido={onAddToPedido}
          onBlockedDelete={onBlockedDelete}
          onDelete={onDelete}
        />
      </div>

      {isCodesExpanded ? (
        <ReceitaCodesPanel linha={linha} panelId={codesPanelId} />
      ) : null}
    </article>
  );
}
