import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import FarmaciaPedidosList from "../../features/farmacia/shared/pedidos/components/FarmaciaPedidosList/FarmaciaPedidosList";

import { FARMACIA_HISTORICO_PAGE } from "../../features/farmacia/historico/config/farmaciaHistoricoPage.config";
import { useFarmaciaHistorico } from "../../features/farmacia/historico/hooks/useFarmaciaHistorico";

import styles from "./FarmaciaHistoricoPage.module.css";

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

export default function FarmaciaHistoricoPage() {
  const {
    pedidos,
    meta,
    selectedStatus,

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
    updateStatus,

    updateSearchInput,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  } = useFarmaciaHistorico();

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
    <section className={styles.page} aria-labelledby="farmacia-historico-title">
      <PageHeader
        titleId="farmacia-historico-title"
        eyebrow={FARMACIA_HISTORICO_PAGE.header.eyebrow}
        title={FARMACIA_HISTORICO_PAGE.header.title}
        description={FARMACIA_HISTORICO_PAGE.header.description}
      />

      <section className={styles.toolbar} aria-label="Filtros do histórico">
        <div className={styles.statusBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>
              {FARMACIA_HISTORICO_PAGE.filters.statusLabel}
            </span>

            <div className={styles.filterOptions}>
              {FARMACIA_HISTORICO_PAGE.filters.options.map((option) => {
                const isActive = selectedStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      isActive
                        ? `${styles.filterButton} ${styles.filterButtonActive}`
                        : styles.filterButton
                    }
                    aria-pressed={isActive}
                    disabled={isLoading || isRefreshing}
                    onClick={() => updateStatus(option.value)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.meta}>
            <span>Total</span>
            <strong>{meta.total}</strong>
          </div>
        </div>

        <form className={styles.filters} onSubmit={handleSubmit}>
          <label className={styles.filterField}>
            <span>{FARMACIA_HISTORICO_PAGE.filters.searchLabel}</span>

            <input
              type="search"
              value={searchInput}
              placeholder={FARMACIA_HISTORICO_PAGE.filters.searchPlaceholder}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateSearchInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{FARMACIA_HISTORICO_PAGE.filters.fromLabel}</span>

            <input
              type="date"
              value={fromInput}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateFromInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{FARMACIA_HISTORICO_PAGE.filters.toLabel}</span>

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
              className={styles.submitButton}
              disabled={isLoading || isRefreshing}
            >
              {FARMACIA_HISTORICO_PAGE.filters.submit}
            </button>

            <button
              type="button"
              className={styles.clearButton}
              disabled={isLoading || isRefreshing}
              onClick={clearFilters}
            >
              {FARMACIA_HISTORICO_PAGE.filters.clear}
            </button>
          </div>
        </form>
      </section>

      <FarmaciaPedidosList
        pedidos={pedidos}
        variant="history"
        sectionConfig={FARMACIA_HISTORICO_PAGE.sections.history}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshHistorico}
      />

      <section
        className={styles.pagination}
        aria-label="Paginação do histórico da Farmácia"
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
