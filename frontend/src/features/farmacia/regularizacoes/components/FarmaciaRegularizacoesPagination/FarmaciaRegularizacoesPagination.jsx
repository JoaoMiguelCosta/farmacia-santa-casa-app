import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import styles from "./FarmaciaRegularizacoesPagination.module.css";

function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) {
    return FARMACIA_REGULARIZACOES_PAGE.pagination.emptyLabel;
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return FARMACIA_REGULARIZACOES_PAGE.pagination.getLabel({
    start,
    end,
    total,
    currentPage,
    totalPages,
  });
}

export default function FarmaciaRegularizacoesPagination({
  meta,
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  isDisabled,
  onPreviousPage,
  onNextPage,
}) {
  const paginationLabel = getPaginationLabel({
    meta,
    currentPage,
    totalPages,
  });

  return (
    <section
      className={styles.pagination}
      aria-label={FARMACIA_REGULARIZACOES_PAGE.pagination.ariaLabel}
    >
      <p className={styles.paginationInfo}>{paginationLabel}</p>

      <div className={styles.paginationActions}>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={!hasPreviousPage || isDisabled}
          onClick={onPreviousPage}
        >
          {FARMACIA_REGULARIZACOES_PAGE.pagination.previous}
        </button>

        <button
          type="button"
          className={styles.paginationButton}
          disabled={!hasNextPage || isDisabled}
          onClick={onNextPage}
        >
          {FARMACIA_REGULARIZACOES_PAGE.pagination.next}
        </button>
      </div>
    </section>
  );
}
