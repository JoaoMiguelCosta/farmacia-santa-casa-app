// src/features/santacasa/sem-receita/components/SemReceitaList/SemReceitaActionsCell.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { SEM_RECEITA_PAGE } from "../../config/semReceitaPage.config";

import { getPedidoButtonLabel } from "../../utils/semReceitaList.utils";

import styles from "./SemReceitaActionsCell.module.css";

export default function SemReceitaActionsCell({
  item,
  pedidoItem,
  quantity,
  quantidadeDisponivel,
  quantidadeEmPedido,
  isPedidoDisabled,
  isDeleting,
  deletingItemId,
  hasPedidoActions,
  hasDeleteActions,
  onPedidoQuantityChange,
  onAddToPedido,
  onBlockedDelete,
  onDelete,
}) {
  return (
    <div className={styles.actionsCell}>
      {hasPedidoActions ? (
        <div className={styles.pedidoAction}>
          <label htmlFor={`sem-receita-pedido-${item.id}`}>
            {SEM_RECEITA_PAGE.list.labels.quantidadeShort}
          </label>

          <input
            id={`sem-receita-pedido-${item.id}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantity}
            disabled={isPedidoDisabled}
            aria-label={`${SEM_RECEITA_PAGE.list.pedidoActions.quantityAriaLabelPrefix} ${item.medicamento}`}
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
              onClick={() =>
                onAddToPedido({
                  ...pedidoItem,
                  quantidade: quantity,
                })
              }
            >
              {getPedidoButtonLabel(quantidadeDisponivel)}
            </Button>
          </div>
        </div>
      ) : null}

      {hasDeleteActions ? (
        <div className={styles.deleteButtonSlot}>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            disabled={Boolean(deletingItemId)}
            onClick={() => {
              if (quantidadeEmPedido > 0) {
                onBlockedDelete?.(item, quantidadeEmPedido);
                return;
              }

              onDelete(item);
            }}
          >
            {isDeleting
              ? SEM_RECEITA_PAGE.list.deletingLabel
              : SEM_RECEITA_PAGE.list.deleteLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
