import PageHeader from "../../shared/ui/PageHeader/PageHeader";


import SantaCasaHistoricoList from "../../features/santacasa/historico/components/SantaCasaHistoricoList/SantaCasaHistoricoList";

import { SANTACASA_HISTORICO_PAGE } from "../../features/santacasa/historico/config/santaCasaHistoricoPage.config";
import { useSantaCasaHistorico } from "../../features/santacasa/historico/hooks/useSantaCasaHistorico";

import styles from "./SantaCasaHistoricoPage.module.css";

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

export default function SantaCasaHistoricoPage() {
  const {
    pedidos,
    meta,

    statusInput,
    searchInput,
    fromInput,
    toInput,

    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    isLoading,
    isRefreshing,
    error,

    refreshHistorico,

    updateStatusInput,
    updateSearchInput,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  } = useSantaCasaHistorico();

  const paginationLabel = getPaginationLabel({
    meta,
    currentPage,
    totalPages,
  });

  function handleSubmit(event) {
    event.preventDefault();
    applyFilters();
  }

  return (
    <section
      className={styles.page}
      aria-labelledby="santacasa-historico-title"
    >
      <PageHeader
        titleId="santacasa-historico-title"
        eyebrow={SANTACASA_HISTORICO_PAGE.header.eyebrow}
        title={SANTACASA_HISTORICO_PAGE.header.title}
        description={SANTACASA_HISTORICO_PAGE.header.description}
      />

   

      <section className={styles.toolbar} aria-label="Filtros do histórico">
        <form className={styles.filters} onSubmit={handleSubmit}>
          <label className={styles.filterField}>
            <span>{SANTACASA_HISTORICO_PAGE.filters.statusLabel}</span>

            <select
              value={statusInput}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateStatusInput(event.target.value)}
            >
              {SANTACASA_HISTORICO_PAGE.filters.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>{SANTACASA_HISTORICO_PAGE.filters.searchLabel}</span>

            <input
              type="search"
              value={searchInput}
              placeholder={SANTACASA_HISTORICO_PAGE.filters.searchPlaceholder}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateSearchInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{SANTACASA_HISTORICO_PAGE.filters.fromLabel}</span>

            <input
              type="date"
              value={fromInput}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateFromInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{SANTACASA_HISTORICO_PAGE.filters.toLabel}</span>

            <input
              type="date"
              value={toInput}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateToInput(event.target.value)}
            />
          </label>

          <div className={styles.filterActions}>
            <button
              type="submit"
              className={styles.filterButton}
              disabled={isLoading || isRefreshing}
            >
              {SANTACASA_HISTORICO_PAGE.filters.submit}
            </button>

            <button
              type="button"
              className={styles.clearButton}
              disabled={isLoading || isRefreshing}
              onClick={clearFilters}
            >
              {SANTACASA_HISTORICO_PAGE.filters.clear}
            </button>
          </div>
        </form>

        <div className={styles.meta}>
          <span>Total</span>
          <strong>{meta.total}</strong>
        </div>
      </section>

      <SantaCasaHistoricoList
        pedidos={pedidos}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshHistorico}
      />

      <section
        className={styles.pagination}
        aria-label="Paginação do histórico da Santa Casa"
      >
        <p className={styles.paginationInfo}>{paginationLabel}</p>

        <div className={styles.paginationActions}>
          <button
            type="button"
            className={styles.clearButton}
            disabled={!hasPreviousPage || isLoading || isRefreshing}
            onClick={goToPreviousPage}
          >
            Anterior
          </button>

          <button
            type="button"
            className={styles.clearButton}
            disabled={!hasNextPage || isLoading || isRefreshing}
            onClick={goToNextPage}
          >
            Seguinte
          </button>
        </div>
      </section>
    </section>
  );
}
