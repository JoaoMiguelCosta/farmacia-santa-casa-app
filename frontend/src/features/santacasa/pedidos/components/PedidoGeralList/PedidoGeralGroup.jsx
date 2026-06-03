// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralGroup.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoGeralItem from "./PedidoGeralItem";

import { usePedidoGeralGroup } from "./usePedidoGeralGroup";

import styles from "./PedidoGeralGroup.module.css";

export default function PedidoGeralGroup({
  group,
  defaultOpen = false,
  isSubmitting = false,
  onRemoveItem,
}) {
  const {
    detailsId,

    isOpen,
    canShowMore,

    visibleItems,
    visibleMedicamentosLabel,
    viewMoreMedicamentosLabel,

    totalMedicamentosLabel,
    totalQuantidadeLabel,
    toggleLabel,

    handleToggleOpen,
    handleShowMore,
    handleShowAll,
  } = usePedidoGeralGroup({
    group,
    defaultOpen,
  });

  return (
    <section className={styles.group}>
      <header className={styles.groupHeader}>
        <div className={styles.groupIdentity}>
          <p className={styles.groupEyebrow}>{PEDIDOS_PAGE.labels.utente}</p>

          <h3>{group.utenteNome}</h3>

          <span>{group.utenteNumero9}</span>
        </div>

        <div className={styles.groupHeaderAside}>
          <div className={styles.groupCounters}>
            <strong>{totalMedicamentosLabel}</strong>
            <em>{totalQuantidadeLabel}</em>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-expanded={isOpen}
            aria-controls={detailsId}
            onClick={handleToggleOpen}
          >
            {toggleLabel}
          </Button>
        </div>
      </header>

      {isOpen ? (
        <div id={detailsId} className={styles.groupDetails}>
          <span className={styles.groupDetailsMeta}>
            {visibleMedicamentosLabel}
          </span>

          <div
            className={styles.items}
            aria-label={PEDIDOS_PAGE.sections.draft.itemsAriaLabel}
          >
            {visibleItems.map((item) => {
              if (!item?.key) return null;

              return (
                <PedidoGeralItem
                  key={item.key}
                  item={item}
                  isSubmitting={isSubmitting}
                  onRemoveItem={onRemoveItem}
                />
              );
            })}
          </div>

          {canShowMore ? (
            <footer className={styles.groupDetailsActions}>
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
      ) : null}
    </section>
  );
}
