import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import { classNames } from "../../../../../shared/utils/classNames";

import styles from "./FarmaciaRegularizacoesToolbar.module.css";

export default function FarmaciaRegularizacoesToolbar({
  tabs,
  activeTab,
  total,
  searchInput,
  medicamentoInput,
  fromInput,
  toInput,
  isDisabled,
  onTabChange,
  onSearchChange,
  onMedicamentoChange,
  onFromChange,
  onToChange,
  onApplyFilters,
  onClearFilters,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onApplyFilters();
  }

  return (
    <section
      className={styles.toolbar}
      aria-label={FARMACIA_REGULARIZACOES_PAGE.toolbar.ariaLabel}
    >
      <div className={styles.topBar}>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label={FARMACIA_REGULARIZACOES_PAGE.toolbar.tabsAriaLabel}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tabs.pending}
            className={classNames(styles.tabButton, activeTab === tabs.pending && styles.tabButtonActive)}
            disabled={isDisabled}
            onClick={() => onTabChange(tabs.pending)}
          >
            {FARMACIA_REGULARIZACOES_PAGE.tabs.pending}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tabs.history}
            className={classNames(styles.tabButton, activeTab === tabs.history && styles.tabButtonActive)}
            disabled={isDisabled}
            onClick={() => onTabChange(tabs.history)}
          >
            {FARMACIA_REGULARIZACOES_PAGE.tabs.history}
          </button>
        </div>

        <div className={styles.meta}>
          <span>{FARMACIA_REGULARIZACOES_PAGE.toolbar.totalLabel}</span>
          <strong>{total}</strong>
        </div>
      </div>

      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.filterField}>
          <span>{FARMACIA_REGULARIZACOES_PAGE.filters.searchLabel}</span>

          <input
            type="search"
            value={searchInput}
            placeholder={FARMACIA_REGULARIZACOES_PAGE.filters.searchPlaceholder}
            disabled={isDisabled}
            onChange={(event) => onSearchChange(event.target.value)}
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
            disabled={isDisabled}
            onChange={(event) => onMedicamentoChange(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>{FARMACIA_REGULARIZACOES_PAGE.filters.fromLabel}</span>

          <input
            type="date"
            value={fromInput}
            disabled={isDisabled}
            onChange={(event) => onFromChange(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>{FARMACIA_REGULARIZACOES_PAGE.filters.toLabel}</span>

          <input
            type="date"
            value={toInput}
            disabled={isDisabled}
            onChange={(event) => onToChange(event.target.value)}
          />
        </label>

        <div className={styles.filterActions}>
          <button
            type="submit"
            className={styles.filterButton}
            disabled={isDisabled}
          >
            {FARMACIA_REGULARIZACOES_PAGE.filters.submit}
          </button>

          <button
            type="button"
            className={styles.clearButton}
            disabled={isDisabled}
            onClick={onClearFilters}
          >
            {FARMACIA_REGULARIZACOES_PAGE.filters.clear}
          </button>
        </div>
      </form>
    </section>
  );
}
