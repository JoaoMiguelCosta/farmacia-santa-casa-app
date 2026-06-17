import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import FarmaciaRegularizacoesList from "../FarmaciaRegularizacoesList/FarmaciaRegularizacoesList";
import FarmaciaRegularizacoesPagination from "../FarmaciaRegularizacoesPagination/FarmaciaRegularizacoesPagination";
import FarmaciaRegularizacoesSignal from "../FarmaciaRegularizacoesSignal/FarmaciaRegularizacoesSignal";
import FarmaciaRegularizacoesToolbar from "../FarmaciaRegularizacoesToolbar/FarmaciaRegularizacoesToolbar";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";
import { useFarmaciaRegularizacoes } from "../../hooks/useFarmaciaRegularizacoes";

import styles from "./FarmaciaRegularizacoesPageContent.module.css";

export default function FarmaciaRegularizacoesPageContent() {
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
  const isDisabled = isLoading || isRefreshing;

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

      <FarmaciaRegularizacoesToolbar
        tabs={tabs}
        activeTab={activeTab}
        total={meta.total}
        searchInput={searchInput}
        medicamentoInput={medicamentoInput}
        fromInput={fromInput}
        toInput={toInput}
        isDisabled={isDisabled}
        onTabChange={updateTab}
        onSearchChange={updateSearchInput}
        onMedicamentoChange={updateMedicamentoInput}
        onFromChange={updateFromInput}
        onToChange={updateToInput}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />

      <FarmaciaRegularizacoesList
        regularizacoes={regularizacoes}
        variant={listVariant}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshRegularizacoes}
      />

      <FarmaciaRegularizacoesPagination
        meta={meta}
        currentPage={currentPage}
        totalPages={totalPages}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        isDisabled={isDisabled}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
      />
    </section>
  );
}
