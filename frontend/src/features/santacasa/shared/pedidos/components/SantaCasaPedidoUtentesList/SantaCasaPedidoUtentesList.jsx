// src/features/santacasa/shared/pedidos/components/SantaCasaPedidoUtentesList/SantaCasaPedidoUtentesList.jsx

import { SANTACASA_PEDIDO_DETAILS } from "../../config/santaCasaPedidoDetails.config";

import { useSantaCasaPedidoUtentes } from "../../hooks/useSantaCasaPedidoUtentes";

import SantaCasaPedidoUtenteGroup from "../SantaCasaPedidoUtenteGroup/SantaCasaPedidoUtenteGroup";

import styles from "./SantaCasaPedidoUtentesList.module.css";

function getSafeDomIdFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-");
}

export default function SantaCasaPedidoUtentesList({
  pedidoId,
  groups = [],
  variant = "pending",
}) {
  const { labels, utentesList, actions } = SANTACASA_PEDIDO_DETAILS;

  const {
    search,
    expandedGroupKey,

    visibleGroups,

    currentPage,
    totalPages,
    totalGroups,

    rangeStart,
    rangeEnd,

    hasPreviousPage,
    hasNextPage,

    changeSearch,
    toggleGroup,

    goToPreviousPage,
    goToNextPage,
  } = useSantaCasaPedidoUtentes({
    groups,
    pageSize: utentesList.pageSize,
  });

  const showSearch = groups.length >= utentesList.searchMinItems;

  const showFooter = showSearch || totalPages > 1;

  const safePedidoId = getSafeDomIdFragment(pedidoId);

  return (
    <section className={styles.section} aria-label={labels.title}>
      <header className={styles.header}>
        <h3 className={styles.title}>{labels.title}</h3>

        <span className={styles.count}>{groups.length}</span>
      </header>

      {showSearch ? (
        <label className={styles.searchField}>
          <span>{utentesList.searchLabel}</span>

          <input
            type="search"
            value={search}
            placeholder={utentesList.searchPlaceholder}
            onChange={(event) => {
              changeSearch(event.target.value);
            }}
          />
        </label>
      ) : null}

      {totalGroups === 0 ? (
        <div className={styles.emptyState}>
          <strong>{utentesList.emptyTitle}</strong>

          <p>{utentesList.emptyDescription}</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {visibleGroups.map((group) => {
            const safeGroupKey = getSafeDomIdFragment(group.key);

            const detailsId =
              `santacasa-pedido-${safePedidoId}` +
              `-utente-${safeGroupKey}-details`;

            return (
              <SantaCasaPedidoUtenteGroup
                key={group.key}
                group={group}
                detailsId={detailsId}
                variant={variant}
                isExpanded={expandedGroupKey === group.key}
                onToggle={() => {
                  toggleGroup(group.key);
                }}
              />
            );
          })}
        </ul>
      )}

      {totalGroups > 0 && showFooter ? (
        <footer className={styles.pagination}>
          <div className={styles.results}>
            <span>
              {utentesList.resultsPrefix}{" "}
              <strong>
                {rangeStart}–{rangeEnd}
              </strong>{" "}
              {utentesList.resultsSeparator} <strong>{totalGroups}</strong>{" "}
              {utentesList.resultsSuffix}
            </span>

            <span>
              {utentesList.pageLabel} <strong>{currentPage}</strong>{" "}
              {utentesList.pageSeparator} <strong>{totalPages}</strong>
            </span>
          </div>

          {totalPages > 1 ? (
            <div className={styles.pageActions}>
              <button
                type="button"
                disabled={!hasPreviousPage}
                onClick={goToPreviousPage}
              >
                {actions.previousPage}
              </button>

              <button
                type="button"
                disabled={!hasNextPage}
                onClick={goToNextPage}
              >
                {actions.nextPage}
              </button>
            </div>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
