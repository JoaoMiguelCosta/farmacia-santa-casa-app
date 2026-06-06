// src/features/santacasa/historico/components/SantaCasaHistoricoPagination/SantaCasaHistoricoPagination.jsx
import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import styles from "./SantaCasaHistoricoPagination.module.css";

function getPedidoLabel(total) {
  return Number(total) === 1
    ? SANTACASA_HISTORICO_PAGE.pagination.pedidoSingular
    : SANTACASA_HISTORICO_PAGE.pagination.pedidoPlural;
}

function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) {
    return SANTACASA_HISTORICO_PAGE.pagination.emptyLabel;
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return [
    SANTACASA_HISTORICO_PAGE.pagination.showingLabel,
    `${start}-${end}`,
    SANTACASA_HISTORICO_PAGE.pagination.ofLabel,
    total,
    `${getPedidoLabel(total)}.`,
    SANTACASA_HISTORICO_PAGE.pagination.pageLabel,
    currentPage,
    SANTACASA_HISTORICO_PAGE.pagination.ofLabel,
    `${totalPages}.`,
  ].join(" ");
}

export default function SantaCasaHistoricoPagination({
  meta,
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  isDisabled = false,
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
      aria-label={SANTACASA_HISTORICO_PAGE.pagination.ariaLabel}
    >
      <p className={styles.paginationInfo}>{paginationLabel}</p>

      <div className={styles.paginationActions}>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={!hasPreviousPage || isDisabled}
          onClick={onPreviousPage}
        >
          {SANTACASA_HISTORICO_PAGE.actions.previous}
        </button>

        <button
          type="button"
          className={styles.paginationButton}
          disabled={!hasNextPage || isDisabled}
          onClick={onNextPage}
        >
          {SANTACASA_HISTORICO_PAGE.actions.next}
        </button>
      </div>
    </section>
  );
}
