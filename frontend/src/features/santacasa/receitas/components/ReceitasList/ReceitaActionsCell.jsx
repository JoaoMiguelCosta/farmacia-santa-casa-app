// src/features/santacasa/receitas/components/ReceitasList/ReceitaActionsCell.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import { getPedidoButtonLabel } from "../../utils/receitasList.utils";

import styles from "./ReceitaActionsCell.module.css";

export default function ReceitaActionsCell({
  linha,
  pedidoItem,
  quantity,
  quantidadeDisponivel,
  quantidadeEmPedido,
  isBlockedByFefo,
  isPedidoDisabled,
  isDeleting,
  deletingLinhaId,
  isCodesExpanded,
  codesPanelId,
  fefoNoticeId,
  hasPedidoActions,
  hasDeleteActions,
  onToggleCodes,
  onPedidoQuantityChange,
  onAddToPedido,
  onBlockedDelete,
  onDelete,
}) {
  const describedBy = isBlockedByFefo ? fefoNoticeId : undefined;

  return (
    <div className={styles.actionsCell}>
      {hasPedidoActions ? (
        <div className={styles.pedidoAction}>
          <label htmlFor={`receita-pedido-${linha.linhaId}`}>
            {RECEITAS_PAGE.list.labels.quantidadeShort}
          </label>

          <input
            id={`receita-pedido-${linha.linhaId}`}
            type="number"
            min="1"
            max={quantidadeDisponivel}
            value={quantity}
            disabled={isPedidoDisabled}
            aria-describedby={describedBy}
            onChange={(event) =>
              onPedidoQuantityChange?.(
                pedidoItem.key,
                event.target.value,
                quantidadeDisponivel,
              )
            }
          />

          <div className={styles.addButtonSlot}>
            <Button
              type="button"
              size="sm"
              disabled={isPedidoDisabled}
              aria-describedby={describedBy}
              onClick={() =>
                onAddToPedido({
                  ...pedidoItem,
                  quantidade: quantity,
                })
              }
            >
              {getPedidoButtonLabel({
                quantidadeDisponivel,
                isBlockedByFefo,
              })}
            </Button>
          </div>
        </div>
      ) : null}

      <div className={styles.codesButtonSlot}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-expanded={isCodesExpanded}
          aria-controls={codesPanelId}
          onClick={() => onToggleCodes(linha.linhaId)}
        >
          {isCodesExpanded
            ? RECEITAS_PAGE.list.codes.hideLabel
            : RECEITAS_PAGE.list.codes.showLabel}
        </Button>
      </div>

      {hasDeleteActions ? (
        <div className={styles.deleteButtonSlot}>
          <Button
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            disabled={Boolean(deletingLinhaId)}
            onClick={() => {
              if (quantidadeEmPedido > 0) {
                onBlockedDelete?.(linha, quantidadeEmPedido);
                return;
              }

              onDelete(linha);
            }}
          >
            {isDeleting
              ? RECEITAS_PAGE.list.deletingLabel
              : RECEITAS_PAGE.list.deleteLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
