import { classNames } from "../../../../../shared/utils/classNames";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import styles from "./SantaCasaRegularizacoesToolbar.module.css";

export default function SantaCasaRegularizacoesToolbar({
  tabs,
  activeTab,
  total,
  searchInput,
  fromInput,
  toInput,
  isLoading,
  isRefreshing,
  onUpdateTab,
  onUpdateSearchInput,
  onUpdateFromInput,
  onUpdateToInput,
  onSubmit,
  onClear,
}) {
  const isDisabled = isLoading || isRefreshing;

  return (
    <section
      className={styles.toolbar}
      aria-label={SANTACASA_REGULARIZACOES_PAGE.toolbar.ariaLabel}
    >
      <div className={styles.topBar}>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label={SANTACASA_REGULARIZACOES_PAGE.toolbar.tabsAriaLabel}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tabs.pending}
            className={classNames(
              styles.tabButton,
              activeTab === tabs.pending && styles.tabButtonActive,
            )}
            disabled={isDisabled}
            onClick={() => onUpdateTab(tabs.pending)}
          >
            {SANTACASA_REGULARIZACOES_PAGE.tabs.pending}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tabs.history}
            className={classNames(
              styles.tabButton,
              activeTab === tabs.history && styles.tabButtonActive,
            )}
            disabled={isDisabled}
            onClick={() => onUpdateTab(tabs.history)}
          >
            {SANTACASA_REGULARIZACOES_PAGE.tabs.history}
          </button>
        </div>

        <div className={styles.meta}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.toolbar.totalLabel}</span>
          <strong>{total}</strong>
        </div>
      </div>

      <form className={styles.filters} onSubmit={onSubmit}>
        <label className={styles.filterField}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.filters.searchLabel}</span>

          <input
            type="search"
            value={searchInput}
            placeholder={SANTACASA_REGULARIZACOES_PAGE.filters.searchPlaceholder}
            disabled={isDisabled}
            onChange={(event) => onUpdateSearchInput(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.filters.fromLabel}</span>

          <input
            type="date"
            value={fromInput}
            disabled={isDisabled}
            onChange={(event) => onUpdateFromInput(event.target.value)}
          />
        </label>

        <label className={styles.filterField}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.filters.toLabel}</span>

          <input
            type="date"
            value={toInput}
            disabled={isDisabled}
            onChange={(event) => onUpdateToInput(event.target.value)}
          />
        </label>

        <div className={styles.filterActions}>
          <button
            type="submit"
            className={styles.filterButton}
            disabled={isDisabled}
          >
            {SANTACASA_REGULARIZACOES_PAGE.filters.submit}
          </button>

          <button
            type="button"
            className={styles.clearButton}
            disabled={isDisabled}
            onClick={onClear}
          >
            {SANTACASA_REGULARIZACOES_PAGE.filters.clear}
          </button>
        </div>
      </form>
    </section>
  );
}
