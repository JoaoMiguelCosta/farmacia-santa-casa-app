// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralItem.jsx
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoGeralControls from "./PedidoGeralControls";
import PedidoGeralQuantitySummary from "./PedidoGeralQuantitySummary";
import PedidoGeralReceitaBarcodes from "./PedidoGeralReceitaBarcodes";
import PedidoGeralTypeBadge from "./PedidoGeralTypeBadge";
import PedidoGeralValidity from "./PedidoGeralValidity";

import {
  getPedidoGeralReceita,
  getQuantityInfo,
  getReceitaValidityLabel,
  hasReceitaBarcodeData,
  isValidPedidoGeralItem,
} from "./pedidoGeralList.utils";

import styles from "./PedidoGeralItem.module.css";

export default function PedidoGeralItem({
  item,
  isSubmitting = false,
  onRemoveItem,
}) {
  if (!isValidPedidoGeralItem(item)) return null;

  const itemKey = item.key;

  const { maximoDisponivel, quantidadeNoPedido, quantidadeNaOrigem } =
    getQuantityInfo(item);

  const receita = getPedidoGeralReceita(item);
  const hasBarcodes = hasReceitaBarcodeData(receita);
  const validadeLabel = getReceitaValidityLabel(receita);

  return (
    <article className={styles.item}>
      <div className={styles.content}>
        <PedidoGeralTypeBadge tipo={item.tipo} />

        <h4>{item.title || PEDIDOS_PAGE.labels.medicamentoFallback}</h4>

        <PedidoGeralValidity validadeLabel={validadeLabel} />

        {hasBarcodes ? (
          <PedidoGeralReceitaBarcodes receita={receita} />
        ) : item.description ? (
          <p>{item.description}</p>
        ) : null}

        <PedidoGeralQuantitySummary
          maximoDisponivel={maximoDisponivel}
          quantidadeNaOrigem={quantidadeNaOrigem}
        />
      </div>

      <PedidoGeralControls
        itemKey={itemKey}
        quantidadeNoPedido={quantidadeNoPedido}
        isSubmitting={isSubmitting}
        onRemoveItem={onRemoveItem}
      />
    </article>
  );
}
