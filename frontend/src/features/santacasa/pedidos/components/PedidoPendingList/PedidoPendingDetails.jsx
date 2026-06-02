// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingDetails.jsx
import { useState } from "react";

import Button from "../../../../../shared/ui/Button/Button";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingItem from "./PedidoPendingItem";

import {
  getLimitedPedidoGroups,
  getMedicamentosCountLabel,
  getNextVisibleMedicamentosCount,
  getPedidoItemKey,
  getRemainingMedicamentosCount,
  getUnidadesCountLabel,
  getViewMoreMedicamentosLabel,
  getVisibleMedicamentosLabel,
  groupPedidoItemsByUtente,
} from "./pedidoPendingList.utils";

import styles from "./PedidoPendingList.module.css";

export default function PedidoPendingDetails({ id, pedido }) {
  const visibleStep = PEDIDOS_PAGE.sections.pending.detailsVisibleLimit;

  const [visibleLimit, setVisibleLimit] = useState(visibleStep);

  const groups = groupPedidoItemsByUtente(pedido?.itens);

  const totalMedicamentos = groups.reduce((total, group) => {
    return total + group.items.length;
  }, 0);

  const totalQuantidade = groups.reduce((total, group) => {
    return (
      total +
      group.items.reduce((groupTotal, item) => {
        return groupTotal + (Number(item?.quantidade) || 0);
      }, 0)
    );
  }, 0);

  const visibleGroups = getLimitedPedidoGroups(groups, visibleLimit);

  const visibleMedicamentos = visibleGroups.reduce((total, group) => {
    return total + group.items.length;
  }, 0);

  const remainingMedicamentos = getRemainingMedicamentosCount({
    visible: visibleMedicamentos,
    total: totalMedicamentos,
    step: visibleStep,
  });

  const canShowMore = visibleMedicamentos < totalMedicamentos;

  if (groups.length === 0) return null;

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
    <div id={id} className={styles.details}>
      <header className={styles.detailsHeader}>
        <div>
          <h4>{PEDIDOS_PAGE.sections.pending.detailsTitle}</h4>

          <p>
            {getMedicamentosCountLabel(totalMedicamentos)} ·{" "}
            {getUnidadesCountLabel(totalQuantidade)}
          </p>

          <span className={styles.detailsMeta}>
            {getVisibleMedicamentosLabel({
              visible: visibleMedicamentos,
              total: totalMedicamentos,
            })}
          </span>
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
  );
}
