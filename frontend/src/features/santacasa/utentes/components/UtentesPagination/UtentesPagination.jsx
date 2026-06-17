// src/features/santacasa/utentes/components/UtentesPagination/UtentesPagination.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { UTENTES_PAGE } from "../../config/utentesPage.config";

import { getUtentesPaginationLabel } from "../../utils/utentesPage.utils";

import styles from "./UtentesPagination.module.css";

export default function UtentesPagination({
  pagination,
  currentPage,
  totalPages,
  hasPreviousPage = false,
  hasNextPage = false,
  isLoading = false,
  isRefreshing = false,
  onPreviousPage,
  onNextPage,
}) {
  const paginationLabel = getUtentesPaginationLabel({
    pagination,
    currentPage,
    totalPages,
  });

  const isDisabled = isLoading || isRefreshing;

  return (
    <section
      className={styles.pagination}
      aria-label={UTENTES_PAGE.pagination.ariaLabel}
    >
      <p className={styles.paginationInfo}>{paginationLabel}</p>

      <div className={styles.paginationActions}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!hasPreviousPage || isDisabled}
          onClick={onPreviousPage}
        >
          {UTENTES_PAGE.pagination.previousLabel}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!hasNextPage || isDisabled}
          onClick={onNextPage}
        >
          {UTENTES_PAGE.pagination.nextLabel}
        </Button>
      </div>
    </section>
  );
}
