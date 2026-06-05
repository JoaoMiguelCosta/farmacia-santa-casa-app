// src/features/santacasa/historico/components/SantaCasaHistoricoFilters/SantaCasaHistoricoFilters.jsx
import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import styles from "./SantaCasaHistoricoFilters.module.css";

export default function SantaCasaHistoricoFilters({
  meta,
  statusInput,
  searchInput,
  fromInput,
  toInput,
  isDisabled = false,
  onApplyFilters,
  onClearFilters,
  onStatusChange,
  onSearchChange,
  onFromChange,
  onToChange,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onApplyFilters?.();
  }

  return (
    <section className={styles.toolbar} aria-label="Filtros do histórico">
      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.filterField}>
          <span>{SANTACASA_HISTORICO_PAGE.filters.statusLabel}</span>

          <select
            value={statusInput}
            disabled={isDisabled}
            onChange={(event) => onStatusChange?.(event.target.value)}
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
            disabled={isDisabled}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>{SANTACASA_HISTORICO_PAGE.filters.fromLabel}</span>

          <input
            type="date"
            value={fromInput}
            disabled={isDisabled}
            onChange={(event) => onFromChange?.(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>{SANTACASA_HISTORICO_PAGE.filters.toLabel}</span>

          <input
            type="date"
            value={toInput}
            disabled={isDisabled}
            onChange={(event) => onToChange?.(event.target.value)}
          />
        </label>

        <div className={styles.filterActions}>
          <button
            type="submit"
            className={styles.filterButton}
            disabled={isDisabled}
          >
            {SANTACASA_HISTORICO_PAGE.filters.submit}
          </button>

          <button
            type="button"
            className={styles.clearButton}
            disabled={isDisabled}
            onClick={onClearFilters}
          >
            {SANTACASA_HISTORICO_PAGE.filters.clear}
          </button>
        </div>
      </form>

      <div className={styles.meta}>
        <span>Total</span>
        <strong>{Number(meta?.total) || 0}</strong>
      </div>
    </section>
  );
}
