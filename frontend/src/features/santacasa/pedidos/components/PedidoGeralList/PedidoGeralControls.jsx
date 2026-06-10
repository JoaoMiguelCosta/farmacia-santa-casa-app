import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDO_GERAL_ITEM } from "./pedidoGeralItem.config";

import styles from "./PedidoGeralItem.module.css";

export default function PedidoGeralControls({
  itemKey,
  quantidadeNoPedido,
  isSubmitting = false,
  onRemoveItem,
}) {
  return (
    <div className={styles.controls}>
      <div className={styles.quantityReadout}>
        <span>Quantidade no pedido</span>

        <strong>{quantidadeNoPedido}</strong>
      </div>

      <div className={styles.removeAction}>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={isSubmitting}
          aria-label={PEDIDO_GERAL_ITEM.labels.removeItemAriaLabel}
          onClick={() => {
            onRemoveItem?.(itemKey);
          }}
        >
          {PEDIDO_GERAL_ITEM.actions.removeItem}
        </Button>
      </div>
    </div>
  );
}
