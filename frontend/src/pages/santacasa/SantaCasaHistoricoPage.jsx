import PageHeader from "../../shared/ui/PageHeader/PageHeader";

import SantaCasaSectionNav from "../../features/santacasa/shared/components/SantaCasaSectionNav/SantaCasaSectionNav";
import SantaCasaHistoricoList from "../../features/santacasa/historico/components/SantaCasaHistoricoList/SantaCasaHistoricoList";

import { SANTACASA_HISTORICO_PAGE } from "../../features/santacasa/historico/config/santaCasaHistoricoPage.config";
import { useSantaCasaHistorico } from "../../features/santacasa/historico/hooks/useSantaCasaHistorico";

import styles from "./SantaCasaHistoricoPage.module.css";

export default function SantaCasaHistoricoPage() {
  const {
    pedidos,
    meta,

    statusInput,
    searchInput,
    fromInput,
    toInput,

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
  } = useSantaCasaHistorico();

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

      <SantaCasaSectionNav />

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
    </section>
  );
}
