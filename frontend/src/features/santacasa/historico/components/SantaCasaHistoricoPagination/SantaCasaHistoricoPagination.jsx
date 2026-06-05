// src/features/santacasa/historico/components/SantaCasaHistoricoPagination/SantaCasaHistoricoPagination.jsx
import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import styles from "./SantaCasaHistoricoPagination.module.css";

function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) {
    return "Sem resultados.";
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return `A mostrar ${start}-${end} de ${total} pedido(s). Página ${currentPage} de ${totalPages}.`;
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
      aria-label="Paginação do histórico da Santa Casa"
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
