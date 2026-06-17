// src/features/farmacia/historico/components/FarmaciaHistoricoPageContent/FarmaciaHistoricoPageContent.jsx
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import FarmaciaPedidosList from "../../../shared/pedidos/components/FarmaciaPedidosList/FarmaciaPedidosList";

import { FARMACIA_HISTORICO_PAGE } from "../../config/farmaciaHistoricoPage.config";

import { useFarmaciaHistorico } from "../../hooks/useFarmaciaHistorico";

import FarmaciaHistoricoFilters from "../FarmaciaHistoricoFilters/FarmaciaHistoricoFilters";

import styles from "./FarmaciaHistoricoPageContent.module.css";

export default function FarmaciaHistoricoPageContent() {
  const {
    pedidos,
    meta,
    pagination: paginationState,

    selectedStatus,

    searchInput,
    fromInput,
    toInput,

    isLoading,
    isRefreshing,
    isQuerying,

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

  const { header, sections, filters, pagination } = FARMACIA_HISTORICO_PAGE;

  const isControlsDisabled = isLoading || isRefreshing || isQuerying;

  const resultLabel =
    meta.total === 1 ? pagination.resultSingular : pagination.resultPlural;

  return (
    <section className={styles.page} aria-labelledby="farmacia-historico-title">
      <PageHeader
        titleId="farmacia-historico-title"
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.description}
      />

      <FarmaciaHistoricoFilters
        config={filters}
        total={meta.total}
        selectedStatus={selectedStatus}
        searchInput={searchInput}
        fromInput={fromInput}
        toInput={toInput}
        isDisabled={isControlsDisabled}
        onStatusChange={updateStatus}
        onSearchChange={updateSearchInput}
        onFromChange={updateFromInput}
        onToChange={updateToInput}
        onSubmit={applyFilters}
        onClear={clearFilters}
      />

      <FarmaciaPedidosList
        pedidos={pedidos}
        variant="history"
        sectionConfig={sections.history}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isQuerying={isQuerying}
        error={error}
        onRefresh={refreshHistorico}
      />

      {meta.total > 0 ? (
        <footer className={styles.pagination} aria-label={pagination.ariaLabel}>
          <div className={styles.paginationInfo}>
            <span>
              {pagination.resultsPrefix}{" "}
              <strong>
                {paginationState.rangeStart}–{paginationState.rangeEnd}
              </strong>{" "}
              {pagination.resultsSeparator} <strong>{meta.total}</strong>{" "}
              {resultLabel}
            </span>

            <span>
              {pagination.pageLabel}{" "}
              <strong>{paginationState.currentPage}</strong>{" "}
              {pagination.pageSeparator}{" "}
              <strong>{paginationState.totalPages}</strong>
            </span>
          </div>

          <div className={styles.paginationActions}>
            <button
              type="button"
              className={styles.paginationButton}
              disabled={!paginationState.hasPreviousPage || isControlsDisabled}
              onClick={goToPreviousPage}
            >
              {pagination.previousLabel}
            </button>

            <button
              type="button"
              className={styles.paginationButton}
              disabled={!paginationState.hasNextPage || isControlsDisabled}
              onClick={goToNextPage}
            >
              {pagination.nextLabel}
            </button>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
