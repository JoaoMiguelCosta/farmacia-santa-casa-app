import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SantaCasaRegularizacoesList from "../../features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/SantaCasaRegularizacoesList";
import SantaCasaRegularizacoesSignal from "../../features/santacasa/regularizacoes/components/SantaCasaRegularizacoesSignal/SantaCasaRegularizacoesSignal";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../features/santacasa/regularizacoes/config/santaCasaRegularizacoesPage.config";
import { useSantaCasaRegularizacoes } from "../../features/santacasa/regularizacoes/hooks/useSantaCasaRegularizacoes";

import styles from "./SantaCasaRegularizacoesPage.module.css";

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

export default function SantaCasaRegularizacoesPage() {
  const {
    tabs,

    activeTab,
    regularizacoes,
    meta,
    signal,

    utentes,
    selectedUtenteId,

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
    isLoadingUtentes,

    error,
    signalError,
    utentesError,

    refreshRegularizacoes,
    updateTab,

    updateSearchInput,
    updateSelectedUtenteId,
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

      <SantaCasaRegularizacoesSignal
        signal={signal}
        isLoading={isLoadingSignal}
        error={signalError}
        isRefreshing={isRefreshing}
        onRefresh={refreshRegularizacoes}
      />

      {utentesError ? (
        <div className={styles.warning} role="alert">
          <strong>Erro ao carregar utentes</strong>
          <span>{utentesError}</span>
        </div>
      ) : null}

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
              {SANTACASA_REGULARIZACOES_PAGE.tabs.pending}
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
              {SANTACASA_REGULARIZACOES_PAGE.tabs.history}
            </button>
          </div>

          <div className={styles.meta}>
            <span>Total</span>
            <strong>{meta.total}</strong>
          </div>
        </div>

        <form className={styles.filters} onSubmit={handleSubmit}>
          <label className={styles.filterField}>
            <span>{SANTACASA_REGULARIZACOES_PAGE.filters.utenteLabel}</span>

            <select
              value={selectedUtenteId}
              disabled={isLoading || isRefreshing || isLoadingUtentes}
              onChange={(event) => updateSelectedUtenteId(event.target.value)}
            >
              <option value="">
                {isLoadingUtentes
                  ? SANTACASA_REGULARIZACOES_PAGE.filters.loadingUtentes
                  : SANTACASA_REGULARIZACOES_PAGE.filters.allUtentes}
              </option>

              {utentes.map((utente) => (
                <option key={utente.id} value={utente.id}>
                  {utente.nome} · {utente.numero9}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>{SANTACASA_REGULARIZACOES_PAGE.filters.searchLabel}</span>

            <input
              type="search"
              value={searchInput}
              placeholder={
                SANTACASA_REGULARIZACOES_PAGE.filters.searchPlaceholder
              }
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateSearchInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{SANTACASA_REGULARIZACOES_PAGE.filters.fromLabel}</span>

            <input
              type="date"
              value={fromInput}
              disabled={isLoading || isRefreshing}
              onChange={(event) => updateFromInput(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            <span>{SANTACASA_REGULARIZACOES_PAGE.filters.toLabel}</span>

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
              {SANTACASA_REGULARIZACOES_PAGE.filters.submit}
            </button>

            <button
              type="button"
              className={styles.clearButton}
              disabled={isLoading || isRefreshing}
              onClick={clearFilters}
            >
              {SANTACASA_REGULARIZACOES_PAGE.filters.clear}
            </button>
          </div>
        </form>
      </section>

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
        aria-label="Paginação das regularizações da Santa Casa"
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
