// src/features/santacasa/extras/components/ExtrasList/ExtraActionsCell.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { EXTRAS_PAGE } from "../../config/extrasPage.config";

import { getPedidoButtonLabel } from "../../utils/extrasList.utils";

import styles from "./ExtraActionsCell.module.css";

export default function ExtraActionsCell({
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
          <label htmlFor={`extra-pedido-${item.id}`}>
            {EXTRAS_PAGE.list.labels.quantidadeShort}
          </label>

          <input
            id={`extra-pedido-${item.id}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantity}
            disabled={isPedidoDisabled}
            aria-label={`${EXTRAS_PAGE.list.pedidoActions.quantityAriaLabelPrefix} ${item.medicamento}`}
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
              ? EXTRAS_PAGE.list.deletingLabel
              : EXTRAS_PAGE.list.deleteLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
