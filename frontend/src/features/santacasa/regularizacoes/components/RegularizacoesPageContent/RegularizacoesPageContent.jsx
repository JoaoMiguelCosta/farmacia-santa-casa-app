import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import SantaCasaRegularizacoesList from "../SantaCasaRegularizacoesList/SantaCasaRegularizacoesList";
import SantaCasaRegularizacoesSignal from "../SantaCasaRegularizacoesSignal/SantaCasaRegularizacoesSignal";
import SantaCasaRegularizacoesToolbar from "../SantaCasaRegularizacoesToolbar/SantaCasaRegularizacoesToolbar";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";
import { useSantaCasaRegularizacoes } from "../../hooks/useSantaCasaRegularizacoes";

import styles from "./RegularizacoesPageContent.module.css";

function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) return SANTACASA_REGULARIZACOES_PAGE.pagination.noResults;

  return SANTACASA_REGULARIZACOES_PAGE.pagination.getPaginationLabel({
    start: skip + 1,
    end: Math.min(skip + take, total),
    total,
    currentPage,
    totalPages,
  });
}

export default function RegularizacoesPageContent() {
  const {
    tabs,

    activeTab,
    regularizacoes,
    meta,
    signal,

    searchInput,
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
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  } = useSantaCasaRegularizacoes();

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
      aria-labelledby="santacasa-regularizacoes-title"
    >
      <PageHeader
        titleId="santacasa-regularizacoes-title"
        eyebrow={SANTACASA_REGULARIZACOES_PAGE.header.eyebrow}
        title={SANTACASA_REGULARIZACOES_PAGE.header.title}
        description={SANTACASA_REGULARIZACOES_PAGE.header.description}
      />

      <SantaCasaRegularizacoesToolbar
        tabs={tabs}
        activeTab={activeTab}
        total={meta.total}
        searchInput={searchInput}
        fromInput={fromInput}
        toInput={toInput}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onUpdateTab={updateTab}
        onUpdateSearchInput={updateSearchInput}
        onUpdateFromInput={updateFromInput}
        onUpdateToInput={updateToInput}
        onSubmit={handleSubmit}
        onClear={clearFilters}
      />

      <SantaCasaRegularizacoesList
        regularizacoes={regularizacoes}
        variant={listVariant}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshRegularizacoes}
      />

      <section
        className={styles.pagination}
        aria-label={SANTACASA_REGULARIZACOES_PAGE.pagination.ariaLabel}
      >
        <p className={styles.paginationInfo}>{paginationLabel}</p>

        <div className={styles.paginationActions}>
          <button
            type="button"
            className={styles.paginationButton}
            disabled={!hasPreviousPage || isLoading || isRefreshing}
            onClick={goToPreviousPage}
          >
            {SANTACASA_REGULARIZACOES_PAGE.pagination.previousLabel}
          </button>

          <button
            type="button"
            className={styles.paginationButton}
            disabled={!hasNextPage || isLoading || isRefreshing}
            onClick={goToNextPage}
          >
            {SANTACASA_REGULARIZACOES_PAGE.pagination.nextLabel}
          </button>
        </div>
      </section>

      <SantaCasaRegularizacoesSignal
        signal={signal}
        isLoading={isLoadingSignal}
        error={signalError}
        isRefreshing={isRefreshing}
        onRefresh={refreshRegularizacoes}
      />
    </section>
  );
}
