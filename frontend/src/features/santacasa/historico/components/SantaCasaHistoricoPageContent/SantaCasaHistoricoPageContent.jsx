// src/features/santacasa/historico/components/SantaCasaHistoricoPageContent/SantaCasaHistoricoPageContent.jsx
import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import SantaCasaHistoricoFilters from "../SantaCasaHistoricoFilters/SantaCasaHistoricoFilters";
import SantaCasaHistoricoList from "../SantaCasaHistoricoList/SantaCasaHistoricoList";
import SantaCasaHistoricoPagination from "../SantaCasaHistoricoPagination/SantaCasaHistoricoPagination";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";
import { useSantaCasaHistorico } from "../../hooks/useSantaCasaHistorico";

import styles from "./SantaCasaHistoricoPageContent.module.css";

export default function SantaCasaHistoricoPageContent() {
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

      <SantaCasaHistoricoFilters
        meta={meta}
        statusInput={statusInput}
        searchInput={searchInput}
        fromInput={fromInput}
        toInput={toInput}
        isDisabled={isLoading || isRefreshing}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        onStatusChange={updateStatusInput}
        onSearchChange={updateSearchInput}
        onFromChange={updateFromInput}
        onToChange={updateToInput}
      />

      <SantaCasaHistoricoList
        pedidos={pedidos}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshHistorico}
      />

      <SantaCasaHistoricoPagination
        meta={meta}
        currentPage={currentPage}
        totalPages={totalPages}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        isDisabled={isLoading || isRefreshing}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
      />
    </section>
  );
}
