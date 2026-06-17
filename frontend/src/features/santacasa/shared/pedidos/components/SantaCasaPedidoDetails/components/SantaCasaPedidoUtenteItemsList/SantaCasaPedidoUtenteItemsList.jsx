import { SANTACASA_PEDIDO_DETAILS } from "../../../../config/santaCasaPedidoDetails.config";

import { useSantaCasaPedidoUtenteItems } from "./useSantaCasaPedidoUtenteItems";

import { getSantaCasaPedidoItemKey } from "../../../../utils/santaCasaPedido.utils";

import SantaCasaPedidoItem from "../SantaCasaPedidoItem/SantaCasaPedidoItem";

import styles from "./SantaCasaPedidoUtenteItemsList.module.css";

const FILTER_KEYS = Object.freeze([
  "ALL",
  "COM_RECEITA",
  "EXTRA",
  "SEM_RECEITA",
]);

function getSafeDomIdFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-");
}

export default function SantaCasaPedidoUtenteItemsList({
  items = [],
  groupKey,
  variant = "pending",
}) {
  const { itemsList, itemFilters, actions } = SANTACASA_PEDIDO_DETAILS;

  const {
    search,
    activeFilter,
    expandedItemKey,

    visibleItems,
    filterCounts,

    currentPage,
    totalPages,
    totalItems,

    rangeStart,
    rangeEnd,

    hasPreviousPage,
    hasNextPage,

    changeSearch,
    changeFilter,
    toggleItem,

    goToPreviousPage,
    goToNextPage,
  } = useSantaCasaPedidoUtenteItems({
    items,
    pageSize: itemsList.pageSize,
  });

  const safeGroupKey = getSafeDomIdFragment(groupKey);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <span>{itemsList.searchLabel}</span>

          <input
            type="search"
            value={search}
            placeholder={itemsList.searchPlaceholder}
            onChange={(event) => {
              changeSearch(event.target.value);
            }}
          />
        </label>

        <div
          className={styles.filters}
          role="group"
          aria-label={itemsList.filtersLabel}
        >
          {FILTER_KEYS.map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              className={styles.filterButton}
              data-active={activeFilter === filterKey ? "true" : "false"}
              aria-pressed={activeFilter === filterKey}
              onClick={() => {
                changeFilter(filterKey);
              }}
            >
              <span>{itemFilters[filterKey]}</span>

              <strong>{filterCounts[filterKey] || 0}</strong>
            </button>
          ))}
        </div>
      </div>

      {totalItems === 0 ? (
        <div className={styles.emptyState}>
          <strong>{itemsList.emptyTitle}</strong>

          <p>{itemsList.emptyDescription}</p>
        </div>
      ) : (
        <>
          <ul className={styles.list}>
            {visibleItems.map((item, index) => {
              const itemKey = String(getSantaCasaPedidoItemKey(item, index));

              const detailsId =
                `santacasa-utente-${safeGroupKey}` +
                `-item-${getSafeDomIdFragment(itemKey)}-details`;

              return (
                <SantaCasaPedidoItem
                  key={itemKey}
                  item={item}
                  variant={variant}
                  detailsId={detailsId}
                  isExpanded={expandedItemKey === itemKey}
                  onToggle={() => {
                    toggleItem(itemKey);
                  }}
                />
              );
            })}
          </ul>

          <footer className={styles.pagination}>
            <div className={styles.results}>
              <span>
                {itemsList.resultsPrefix}{" "}
                <strong>
                  {rangeStart}–{rangeEnd}
                </strong>{" "}
                {itemsList.resultsSeparator} <strong>{totalItems}</strong>{" "}
                {itemsList.resultsSuffix}
              </span>

              <span>
                {itemsList.pageLabel} <strong>{currentPage}</strong>{" "}
                {itemsList.pageSeparator} <strong>{totalPages}</strong>
              </span>
            </div>

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
          </footer>
        </>
      )}
    </div>
  );
}
