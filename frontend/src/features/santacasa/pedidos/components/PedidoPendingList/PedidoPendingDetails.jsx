// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingDetails.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingItem from "./PedidoPendingItem";

import {
  getMedicamentosCountLabel,
  getPedidoItemKey,
} from "./pedidoPendingList.utils";

import { usePedidoPendingDetails } from "./usePedidoPendingDetails";

import styles from "./PedidoPendingCard.module.css";

export default function PedidoPendingDetails({ id, pedido }) {
  const {
    hasGroups,
    canShowMore,

    visibleGroups,
    totalResumoLabel,
    visibleMedicamentosLabel,
    viewMoreMedicamentosLabel,

    handleShowMore,
    handleShowAll,
  } = usePedidoPendingDetails(pedido);

  if (!hasGroups) return null;

  return (
    <div id={id} className={styles.details}>
      <header className={styles.detailsHeader}>
        <div>
          <h4>{PEDIDOS_PAGE.sections.pending.detailsTitle}</h4>

          <p>{totalResumoLabel}</p>

          <span className={styles.detailsMeta}>{visibleMedicamentosLabel}</span>
        </div>
      </header>

      <div className={styles.utenteGroups}>
        {visibleGroups.map((group) => (
          <section key={group.utenteId} className={styles.utenteGroup}>
            <header className={styles.utenteHeader}>
              <div>
                <span>{PEDIDOS_PAGE.labels.utente}</span>

                <strong>{group.utenteNome}</strong>

                <small>
                  {PEDIDOS_PAGE.labels.numeroUtente} {group.utenteNumero9}
                </small>
              </div>

              <em>{getMedicamentosCountLabel(group.items.length)}</em>
            </header>

            <ul
              className={styles.detailsItems}
              aria-label={PEDIDOS_PAGE.sections.pending.itemsAriaLabel}
            >
              {group.items.map((item, index) => (
                <PedidoPendingItem
                  key={getPedidoItemKey(item, index)}
                  item={item}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {canShowMore ? (
        <footer className={styles.detailsActions}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleShowMore}
          >
            {viewMoreMedicamentosLabel}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleShowAll}
          >
            {PEDIDOS_PAGE.actions.viewAllMedicamentos}
          </Button>
        </footer>
      ) : null}
    </div>
  );
}
