import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import FarmaciaRegularizacoesList from "../../features/farmacia/regularizacoes/components/FarmaciaRegularizacoesList/FarmaciaRegularizacoesList";
import FarmaciaRegularizacoesSignal from "../../features/farmacia/regularizacoes/components/FarmaciaRegularizacoesSignal/FarmaciaRegularizacoesSignal";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../features/farmacia/regularizacoes/config/farmaciaRegularizacoesPage.config";
import { useFarmaciaRegularizacoes } from "../../features/farmacia/regularizacoes/hooks/useFarmaciaRegularizacoes";

import styles from "./FarmaciaRegularizacoesPage.module.css";

function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) {
    return "Sem resultados.";
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return `A mostrar ${start}-${end} de ${total} regularização(ões). Página ${currentPage} de ${totalPages}.`;
}

export default function FarmaciaRegularizacoesPage() {
  const {
    tabs,

    activeTab,
    regularizacoes,
    meta,
    signal,

    searchInput,
    medicamentoInput,
    fromInput,
    toInput,

    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    isLoading,
    isRefreshing,
    isLoadingSignal,

    error,
    signalError,

    refreshRegularizacoes,
    updateTab,

    updateSearchInput,
    updateMedicamentoInput,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  } = useFarmaciaRegularizacoes();

  const isHistory = activeTab === tabs.history;
  const listVariant = isHistory ? "history" : "pending";

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
      aria-labelledby="farmacia-regularizacoes-title"
    >
      <PageHeader
        titleId="farmacia-regularizacoes-title"
        eyebrow={FARMACIA_REGULARIZACOES_PAGE.header.eyebrow}
        title={FARMACIA_REGULARIZACOES_PAGE.header.title}
        description={FARMACIA_REGULARIZACOES_PAGE.header.description}
      />

      <FarmaciaRegularizacoesSignal
        signal={signal}
        isLoading={isLoadingSignal}
        error={signalError}
        isRefreshing={isRefreshing}
        onRefresh={refreshRegularizacoes}
      />

      <section className={styles.toolbar} aria-label="Controlos da página">
        <div className={styles.topBar}>
          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Regularizações"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tabs.pending}
              className={
                activeTab === tabs.pending
                  ? `${styles.tabButton} ${styles.tabButtonActive}`
                  : styles.tabButton
              }
              disabled={isLoading || isRefreshing}
              onClick={() => updateTab(tabs.pending)}
            >
              {FARMACIA_REGULARIZACOES_PAGE.tabs.pending}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tabs.history}
              className={
                activeTab === tabs.history
                  ? `${styles.tabButton} ${styles.tabButtonActive}`
                  : styles.tabButton
              }
              disabled={isLoading || isRefreshing}
              onClick={() => updateTab(tabs.history)}
            >
              {FARMACIA_REGULARIZACOES_PAGE.tabs.history}
            </button>
          </div>

          <div className={styles.meta}>
            <span>Total</span>
            <strong>{meta.total}</strong>
          </div>
        </div>

        <form className={styles.filters} onSubmit={handleSubmit}>
          <label className={styles.filterField}>
            <span>{FARMACIA_REGULARIZACOES_PAGE.filters.searchLabel}</span>

            <input
              type="search"
              value={searchInput}
              placeholder={
                FARMACIA_REGULARIZACOES_PAGE.filters.searchPlaceholder
              }
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateSearchInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{FARMACIA_REGULARIZACOES_PAGE.filters.medicamentoLabel}</span>

            <input
              type="search"
              value={medicamentoInput}
              placeholder={
                FARMACIA_REGULARIZACOES_PAGE.filters.medicamentoPlaceholder
              }
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateMedicamentoInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{FARMACIA_REGULARIZACOES_PAGE.filters.fromLabel}</span>

            <input
              type="date"
              value={fromInput}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateFromInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{FARMACIA_REGULARIZACOES_PAGE.filters.toLabel}</span>

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
              {FARMACIA_REGULARIZACOES_PAGE.filters.submit}
            </button>

            <button
              type="button"
              className={styles.clearButton}
              disabled={isLoading || isRefreshing}
              onClick={clearFilters}
            >
              {FARMACIA_REGULARIZACOES_PAGE.filters.clear}
            </button>
          </div>
        </form>
      </section>

      <FarmaciaRegularizacoesList
        regularizacoes={regularizacoes}
        variant={listVariant}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshRegularizacoes}
      />

      <section
        className={styles.pagination}
        aria-label="Paginação das regularizações da Farmácia"
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
