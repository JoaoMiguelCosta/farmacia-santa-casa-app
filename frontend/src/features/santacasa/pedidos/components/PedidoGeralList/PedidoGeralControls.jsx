// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralControls.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

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
        <span>{PEDIDOS_PAGE.labels.quantity}:</span>
        <strong>{quantidadeNoPedido}</strong>
      </div>

      <Button
        type="button"
        variant="danger"
        size="sm"
        disabled={isSubmitting}
        onClick={() => onRemoveItem?.(itemKey)}
      >
        {PEDIDOS_PAGE.labels.removeFromPedido}
      </Button>
    </div>
  );
}
