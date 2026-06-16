import styles from "./FarmaciaPedidosPagination.module.css";

export default function FarmaciaPedidosPagination({
  config,
  pagination,
  totalPedidos,
  isDisabled = false,
  onPreviousPage,
  onNextPage,
}) {
  if (!config || !pagination || totalPedidos <= 0) {
    return null;
  }

  const resultLabel =
    totalPedidos === 1 ? config.resultSingular : config.resultPlural;

  return (
    <footer className={styles.pagination}>
      <div className={styles.paginationInfo}>
        <span>
          {config.resultsPrefix}{" "}
          <strong>
            {pagination.rangeStart}–{pagination.rangeEnd}
          </strong>{" "}
          {config.resultsSeparator} <strong>{totalPedidos}</strong>{" "}
          {resultLabel}
        </span>

        <span>
          {config.pageLabel} <strong>{pagination.currentPage}</strong>{" "}
          {config.pageSeparator} <strong>{pagination.totalPages}</strong>
        </span>
      </div>

      <div className={styles.paginationActions}>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={isDisabled || !pagination.hasPreviousPage}
          onClick={onPreviousPage}
        >
          {config.previousLabel}
        </button>

        <button
          type="button"
          className={styles.paginationButton}
          disabled={isDisabled || !pagination.hasNextPage}
          onClick={onNextPage}
        >
          {config.nextLabel}
        </button>
      </div>
    </footer>
  );
}
