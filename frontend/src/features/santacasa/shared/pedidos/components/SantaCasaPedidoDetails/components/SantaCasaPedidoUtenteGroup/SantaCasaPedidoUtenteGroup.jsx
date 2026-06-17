import { SANTACASA_PEDIDO_DETAILS } from "../../../../config/santaCasaPedidoDetails.config";

import SantaCasaPedidoUtenteItemsList from "../SantaCasaPedidoUtenteItemsList/SantaCasaPedidoUtenteItemsList";

import styles from "./SantaCasaPedidoUtenteGroup.module.css";

function getItemsLabel(itemsCount) {
  return itemsCount === 1
    ? SANTACASA_PEDIDO_DETAILS.labels.itemSingular
    : SANTACASA_PEDIDO_DETAILS.labels.itemPlural;
}

export default function SantaCasaPedidoUtenteGroup({
  group,
  detailsId,
  variant = "pending",
  isExpanded = false,
  onToggle,
}) {
  if (!group) {
    return null;
  }

  const { key, utente, items, itemsCount, totalQuantity } = group;

  return (
    <li className={styles.group} data-expanded={isExpanded ? "true" : "false"}>
      <div className={styles.summary}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {SANTACASA_PEDIDO_DETAILS.labels.utente}
          </span>

          <strong className={styles.name}>{utente.nome}</strong>

          <span className={styles.number}>
            {SANTACASA_PEDIDO_DETAILS.labels.numeroUtente}: {utente.numero9}
          </span>
        </div>

        <dl className={styles.metrics}>
          <div className={styles.metric}>
            <dt>{SANTACASA_PEDIDO_DETAILS.labels.totalItems}</dt>

            <dd>
              {itemsCount} {getItemsLabel(itemsCount)}
            </dd>
          </div>

          <div className={styles.metric}>
            <dt>{SANTACASA_PEDIDO_DETAILS.labels.totalQuantity}</dt>

            <dd>{totalQuantity}</dd>
          </div>
        </dl>

        <button
          type="button"
          className={styles.toggleButton}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          onClick={onToggle}
        >
          {isExpanded
            ? SANTACASA_PEDIDO_DETAILS.actions.hideMedicamentos
            : SANTACASA_PEDIDO_DETAILS.actions.viewMedicamentos}
        </button>
      </div>

      {isExpanded ? (
        <section
          id={detailsId}
          className={styles.details}
          aria-label={`${SANTACASA_PEDIDO_DETAILS.labels.itemsAriaLabel} — ${utente.nome}`}
        >
          <SantaCasaPedidoUtenteItemsList
            items={items}
            groupKey={key}
            variant={variant}
          />
        </section>
      ) : null}
    </li>
  );
}
