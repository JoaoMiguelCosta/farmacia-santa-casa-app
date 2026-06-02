// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralItem.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoGeralReceitaBarcodes from "./PedidoGeralReceitaBarcodes";

import {
  getPedidoGeralReceita,
  getQuantityInfo,
  getReceitaValidityLabel,
  getTypeLabel,
  hasReceitaBarcodeData,
  isValidPedidoGeralItem,
} from "./pedidoGeralList.utils";

import styles from "./PedidoGeralList.module.css";

function getTypeClassName(tipo) {
  if (tipo === "COM_RECEITA") return styles.receita;
  if (tipo === "SEM_RECEITA") return styles.semReceita;
  if (tipo === "EXTRA") return styles.extra;

  return styles.defaultType;
}

function getRemainingQuantityClassName(quantidadeNaOrigem) {
  return [
    styles.remainingQuantity,
    quantidadeNaOrigem > 0 ? styles.remainingAvailable : styles.remainingEmpty,
  ]
    .filter(Boolean)
    .join(" ");
}

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

  const badgeClassName = [styles.badge, getTypeClassName(item.tipo)]
    .filter(Boolean)
    .join(" ");

  const remainingQuantityClassName =
    getRemainingQuantityClassName(quantidadeNaOrigem);

  return (
    <article className={styles.item}>
      <div className={styles.content}>
        <span className={badgeClassName}>{getTypeLabel(item.tipo)}</span>

        <h4>{item.title || PEDIDOS_PAGE.labels.medicamentoFallback}</h4>

        {validadeLabel ? (
          <span className={styles.receitaValidity}>
            <strong>{PEDIDOS_PAGE.labels.validadeReceita}:</strong>{" "}
            {validadeLabel}
          </span>
        ) : null}

        {hasBarcodes ? (
          <PedidoGeralReceitaBarcodes receita={receita} />
        ) : item.description ? (
          <p>{item.description}</p>
        ) : null}

        <div className={styles.quantitySummary}>
          <span className={styles.availableQuantity}>
            <strong>{PEDIDOS_PAGE.labels.maxAvailable}:</strong>{" "}
            {maximoDisponivel}
          </span>

          <span className={remainingQuantityClassName}>
            <strong>{PEDIDOS_PAGE.labels.availableAtOrigin}:</strong>{" "}
            {quantidadeNaOrigem}
          </span>
        </div>
      </div>

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
    </article>
  );
}
