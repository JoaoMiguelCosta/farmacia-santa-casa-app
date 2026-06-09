// src/features/farmacia/shared/pedidos/components/FarmaciaPedidoUtenteGroup/FarmaciaPedidoUtenteGroup.jsx
import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import FarmaciaPedidoUtenteItemsList from "../FarmaciaPedidoUtenteItemsList/FarmaciaPedidoUtenteItemsList";

import styles from "./FarmaciaPedidoUtenteGroup.module.css";

function getItemsLabel(itemsCount) {
  return itemsCount === 1
    ? FARMACIA_PEDIDO_UI.labels.itemSingular
    : FARMACIA_PEDIDO_UI.labels.itemPlural;
}

export default function FarmaciaPedidoUtenteGroup({
  group,
  detailsId,
  variant = "pending",
  isExpanded = false,
  onToggle,
}) {
  if (!group) return null;

  const { key, utente, items, itemsCount, totalQuantity } = group;

  return (
    <li className={styles.group} data-expanded={isExpanded ? "true" : "false"}>
      <div className={styles.summary}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {FARMACIA_PEDIDO_UI.labels.utente}
          </span>

          <strong className={styles.name}>{utente.nome}</strong>

          <span className={styles.number}>
            {FARMACIA_PEDIDO_UI.labels.utenteNumber}: {utente.numero9}
          </span>
        </div>

        <dl className={styles.metrics}>
          <div className={styles.metric}>
            <dt>{FARMACIA_PEDIDO_UI.labels.totalItems}</dt>

            <dd>
              {itemsCount} {getItemsLabel(itemsCount)}
            </dd>
          </div>

          <div className={styles.metric}>
            <dt>{FARMACIA_PEDIDO_UI.labels.totalQuantity}</dt>

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
            ? FARMACIA_PEDIDO_UI.actions.hideMedicamentos
            : FARMACIA_PEDIDO_UI.actions.viewMedicamentos}
        </button>
      </div>

      {isExpanded ? (
        <section
          id={detailsId}
          className={styles.details}
          aria-label={`${FARMACIA_PEDIDO_UI.labels.items} — ${utente.nome}`}
        >
          <FarmaciaPedidoUtenteItemsList
            items={items}
            groupKey={key}
            variant={variant}
          />
        </section>
      ) : null}
    </li>
  );
}
