import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import FarmaciaRegularizacoesList from "../../features/farmacia/regularizacoes/components/FarmaciaRegularizacoesList/FarmaciaRegularizacoesList";
import FarmaciaRegularizacoesSignal from "../../features/farmacia/regularizacoes/components/FarmaciaRegularizacoesSignal/FarmaciaRegularizacoesSignal";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../features/farmacia/regularizacoes/config/farmaciaRegularizacoesPage.config";
import { useFarmaciaRegularizacoes } from "../../features/farmacia/regularizacoes/hooks/useFarmaciaRegularizacoes";

import styles from "./FarmaciaRegularizacoesPage.module.css";

export default function FarmaciaRegularizacoesPage() {
  const {
    tabs,

    activeTab,
    regularizacoes,
    meta,
    signal,
    medicamentoInput,

    isLoading,
    isRefreshing,
    isLoadingSignal,

    error,
    signalError,

    refreshRegularizacoes,
    updateTab,
    updateMedicamentoInput,
    applyFilters,
    clearFilters,
  } = useFarmaciaRegularizacoes();

  const isHistory = activeTab === tabs.history;
  const listVariant = isHistory ? "history" : "pending";

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
        <div className={styles.tabs} role="tablist" aria-label="Regularizações">
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

        <form className={styles.filters} onSubmit={handleSubmit}>
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

          <div className={styles.filterActions}>
            <button
              type="submit"
              className={styles.filterButton}
              disabled={isLoading || isRefreshing}
            >
              Filtrar
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

        <div className={styles.meta}>
          <span>Total</span>
          <strong>{meta.total}</strong>
        </div>
      </section>

      <FarmaciaRegularizacoesList
        regularizacoes={regularizacoes}
        variant={listVariant}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={refreshRegularizacoes}
      />
    </section>
  );
}
