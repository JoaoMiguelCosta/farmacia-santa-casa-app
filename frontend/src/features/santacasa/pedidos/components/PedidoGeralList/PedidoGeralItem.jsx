import { useState } from "react";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoGeralControls from "./PedidoGeralControls";
import { PEDIDO_GERAL_ITEM } from "./pedidoGeralItem.config";
import PedidoGeralQuantitySummary from "./PedidoGeralQuantitySummary";
import PedidoGeralReceitaBarcodes from "./PedidoGeralReceitaBarcodes";
import PedidoGeralTypeBadge from "./PedidoGeralTypeBadge";
import PedidoGeralValidity from "./PedidoGeralValidity";

import {
  getPedidoGeralReceita,
  getQuantityInfo,
  getReceitaValidityLabel,
  getSafeDetailsId,
  hasReceitaBarcodeData,
  isValidPedidoGeralItem,
} from "./pedidoGeralList.utils";

import styles from "./PedidoGeralItem.module.css";

export default function PedidoGeralItem({
  item,
  isSubmitting = false,
  onRemoveItem,
}) {
  const [isReceitaOpen, setIsReceitaOpen] = useState(false);

  if (!isValidPedidoGeralItem(item)) {
    return null;
  }

  const itemKey = item.key;

  const { maximoDisponivel, quantidadeNoPedido, quantidadeNaOrigem } =
    getQuantityInfo(item);

  const receita = getPedidoGeralReceita(item);

  const hasBarcodes = hasReceitaBarcodeData(receita);

  const validadeLabel = getReceitaValidityLabel(receita);

  const receitaDetailsId = getSafeDetailsId("pedido-geral-receita", itemKey);

  function handleToggleReceita() {
    setIsReceitaOpen((currentValue) => !currentValue);
  }

  return (
    <article
      className={styles.item}
      data-type={item.tipo}
      data-expanded={isReceitaOpen ? "true" : "false"}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <PedidoGeralTypeBadge tipo={item.tipo} />

          <h4>{item.title || PEDIDOS_PAGE.labels.medicamentoFallback}</h4>
        </div>

        <div className={styles.side}>
          <PedidoGeralValidity validadeLabel={validadeLabel} />

          <PedidoGeralControls
            itemKey={itemKey}
            quantidadeNoPedido={quantidadeNoPedido}
            isSubmitting={isSubmitting}
            onRemoveItem={onRemoveItem}
          />

          {hasBarcodes ? (
            <button
              type="button"
              className={styles.toggleButton}
              disabled={isSubmitting}
              aria-expanded={isReceitaOpen}
              aria-controls={receitaDetailsId}
              onClick={handleToggleReceita}
            >
              {isReceitaOpen
                ? PEDIDO_GERAL_ITEM.actions.hideReceita
                : PEDIDO_GERAL_ITEM.actions.viewReceita}
            </button>
          ) : null}
        </div>
      </header>

      <div className={styles.availability}>
        <PedidoGeralQuantitySummary
          maximoDisponivel={maximoDisponivel}
          quantidadeNaOrigem={quantidadeNaOrigem}
        />
      </div>

      {hasBarcodes && isReceitaOpen ? (
        <section
          id={receitaDetailsId}
          className={styles.details}
          aria-label={PEDIDO_GERAL_ITEM.labels.receitaCodesAriaLabel}
        >
          <span className={styles.detailsLabel}>
            {PEDIDO_GERAL_ITEM.labels.receitaCodes}
          </span>

          <PedidoGeralReceitaBarcodes receita={receita} />
        </section>
      ) : null}
    </article>
  );
}
