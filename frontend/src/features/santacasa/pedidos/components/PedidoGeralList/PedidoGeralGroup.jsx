// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralGroup.jsx
import { useState } from "react";

import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoGeralItem from "./PedidoGeralItem";

import {
  getItemsQuantityTotal,
  getLimitedPedidoItems,
  getMedicamentosCountLabel,
  getNextVisibleMedicamentosCount,
  getRemainingMedicamentosCount,
  getSafeDetailsId,
  getUnidadesCountLabel,
  getViewMoreMedicamentosLabel,
  getVisibleMedicamentosLabel,
} from "./pedidoGeralList.utils";

import styles from "./PedidoGeralList.module.css";

export default function PedidoGeralGroup({
  group,
  defaultOpen = false,
  isSubmitting = false,
  onRemoveItem,
}) {
  const visibleStep = PEDIDOS_PAGE.sections.draft.detailsVisibleLimit;
  const detailsId = getSafeDetailsId("pedido-geral-utente", group.utenteId);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [visibleLimit, setVisibleLimit] = useState(visibleStep);

  const totalMedicamentos = group.items.length;
  const totalQuantidade = getItemsQuantityTotal(group.items);

  const visibleItems = getLimitedPedidoItems(group.items, visibleLimit);
  const visibleMedicamentos = visibleItems.length;

  const remainingMedicamentos = getRemainingMedicamentosCount({
    visible: visibleMedicamentos,
    total: totalMedicamentos,
    step: visibleStep,
  });

  const canShowMore = visibleMedicamentos < totalMedicamentos;

  const toggleLabel = isOpen
    ? PEDIDOS_PAGE.actions.hideMedicamentos
    : PEDIDOS_PAGE.actions.viewMedicamentos;

  function handleToggleOpen() {
    setIsOpen((currentValue) => !currentValue);
  }

  function handleShowMore() {
    setVisibleLimit((currentVisibleLimit) =>
      getNextVisibleMedicamentosCount({
        currentVisible: currentVisibleLimit,
        total: totalMedicamentos,
        step: visibleStep,
      }),
    );
  }

  function handleShowAll() {
    setVisibleLimit(totalMedicamentos);
  }

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
            <strong>{getMedicamentosCountLabel(totalMedicamentos)}</strong>
            <em>{getUnidadesCountLabel(totalQuantidade)}</em>
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
            {getVisibleMedicamentosLabel({
              visible: visibleMedicamentos,
              total: totalMedicamentos,
            })}
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
                {getViewMoreMedicamentosLabel(remainingMedicamentos)}
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
