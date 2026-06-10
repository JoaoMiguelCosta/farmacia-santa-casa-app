// src/features/santacasa/pedidos/components/PedidoGeralList/PedidoGeralGroup.jsx

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoGeralItem from "./PedidoGeralItem";

import { usePedidoGeralGroup } from "./usePedidoGeralGroup";

import styles from "./PedidoGeralGroup.module.css";

const FILTER_KEYS = Object.freeze([
  "ALL",
  "COM_RECEITA",
  "EXTRA",
  "SEM_RECEITA",
]);

export default function PedidoGeralGroup({
  group,
  defaultOpen = false,
  isSubmitting = false,
  onRemoveItem,
}) {
  const {
    detailsId,

    isOpen,
    search,
    activeFilter,

    filterCounts,
    visibleItems,

    currentPage,
    totalPages,
    totalFilteredItems,

    rangeStart,
    rangeEnd,

    hasPreviousPage,
    hasNextPage,

    totalMedicamentosLabel,
    totalQuantidadeLabel,
    toggleLabel,

    handleToggleOpen,
    handleSearchChange,
    handleFilterChange,

    handlePreviousPage,
    handleNextPage,
  } = usePedidoGeralGroup({
    group,
    defaultOpen,
  });

  const { itemsList, itemFilters } = PEDIDOS_PAGE.sections.draft;

  const searchInputId = `${detailsId}-search`;

  return (
    <section className={styles.group} data-expanded={isOpen ? "true" : "false"}>
      <header className={styles.groupHeader}>
        <div className={styles.groupIdentity}>
          <span className={styles.groupEyebrow}>
            {PEDIDOS_PAGE.labels.utente}
          </span>

          <h3>{group.utenteNome}</h3>

          <span className={styles.groupNumber}>
            {PEDIDOS_PAGE.labels.numeroUtente}:{" "}
            {group.utenteNumero9 || PEDIDOS_PAGE.labels.emptyValue}
          </span>
        </div>

        <dl className={styles.groupMetrics}>
          <div className={styles.metric}>
            <dt>{PEDIDOS_PAGE.labels.items}</dt>

            <dd>{totalMedicamentosLabel}</dd>
          </div>

          <div className={styles.metric}>
            <dt>{PEDIDOS_PAGE.labels.totalQuantity}</dt>

            <dd>{totalQuantidadeLabel}</dd>
          </div>
        </dl>

        <button
          type="button"
          className={styles.toggleButton}
          disabled={isSubmitting}
          aria-expanded={isOpen}
          aria-controls={detailsId}
          onClick={handleToggleOpen}
        >
          {toggleLabel}
        </button>
      </header>

      {isOpen ? (
        <div id={detailsId} className={styles.groupDetails}>
          <div className={styles.toolbar}>
            <label className={styles.searchField} htmlFor={searchInputId}>
              <span>{itemsList.searchLabel}</span>

              <input
                id={searchInputId}
                type="search"
                value={search}
                disabled={isSubmitting}
                placeholder={itemsList.searchPlaceholder}
                onChange={(event) => {
                  handleSearchChange(event.target.value);
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
                  disabled={isSubmitting}
                  data-active={activeFilter === filterKey ? "true" : "false"}
                  aria-pressed={activeFilter === filterKey}
                  onClick={() => {
                    handleFilterChange(filterKey);
                  }}
                >
                  <span>{itemFilters[filterKey]}</span>

                  <strong>{filterCounts[filterKey] || 0}</strong>
                </button>
              ))}
            </div>
          </div>

          {totalFilteredItems === 0 ? (
            <div className={styles.emptyState}>
              <strong>{itemsList.emptyTitle}</strong>

              <p>{itemsList.emptyDescription}</p>
            </div>
          ) : (
            <>
              <div
                className={styles.items}
                aria-label={PEDIDOS_PAGE.sections.draft.itemsAriaLabel}
              >
                {visibleItems.map((item) => {
                  if (!item?.key) {
                    return null;
                  }

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

              <footer className={styles.pagination}>
                <div className={styles.results}>
                  <span>
                    {itemsList.resultsPrefix}{" "}
                    <strong>
                      {rangeStart}–{rangeEnd}
                    </strong>{" "}
                    {itemsList.resultsSeparator}{" "}
                    <strong>{totalFilteredItems}</strong>{" "}
                    {itemsList.resultsSuffix}
                  </span>

                  <span>
                    {itemsList.pageLabel} <strong>{currentPage}</strong>{" "}
                    {itemsList.pageSeparator} <strong>{totalPages}</strong>
                  </span>
                </div>

                {totalPages > 1 ? (
                  <div className={styles.pageActions}>
                    <button
                      type="button"
                      className={styles.pageButton}
                      disabled={isSubmitting || !hasPreviousPage}
                      onClick={handlePreviousPage}
                    >
                      {PEDIDOS_PAGE.actions.previous}
                    </button>

                    <button
                      type="button"
                      className={styles.pageButton}
                      disabled={isSubmitting || !hasNextPage}
                      onClick={handleNextPage}
                    >
                      {PEDIDOS_PAGE.actions.next}
                    </button>
                  </div>
                ) : null}
              </footer>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
