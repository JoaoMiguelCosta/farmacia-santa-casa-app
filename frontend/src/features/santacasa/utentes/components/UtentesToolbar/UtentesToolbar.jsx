// src/features/santacasa/utentes/components/UtentesToolbar/UtentesToolbar.jsx
import Button from "../../../../../shared/ui/Button/Button";

import { UTENTES_PAGE } from "../../config/utentesPage.config";

import styles from "./UtentesToolbar.module.css";

export default function UtentesToolbar({
  statusFilter,
  statusOptions = [],

  searchInput = "",
  searchQuery = "",

  isLoading = false,
  isRefreshing = false,

  updateStatusFilter,
  updateSearchInput,
  handleSubmitSearch,
  handleClearSearch,
}) {
  const isDisabled = isLoading || isRefreshing;
  const canClearSearch = Boolean(searchInput || searchQuery);

  return (
    <section
      className={styles.toolbar}
      aria-label={UTENTES_PAGE.toolbar.ariaLabel}
    >
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>
          {UTENTES_PAGE.toolbar.statusLabel}
        </span>

        <div className={styles.filterOptions}>
          {statusOptions.map((option) => {
            const isActive = statusFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={
                  isActive
                    ? `${styles.filterButton} ${styles.filterButtonActive}`
                    : styles.filterButton
                }
                disabled={isDisabled}
                aria-pressed={isActive}
                onClick={() => updateStatusFilter(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <form className={styles.searchGroup} onSubmit={handleSubmitSearch}>
        <label
          className={styles.filterLabel}
          htmlFor={UTENTES_PAGE.page.searchInputId}
        >
          {UTENTES_PAGE.toolbar.searchLabel}
        </label>

        <div className={styles.searchControls}>
          <input
            id={UTENTES_PAGE.page.searchInputId}
            className={styles.searchInput}
            type="search"
            placeholder={UTENTES_PAGE.toolbar.searchPlaceholder}
            value={searchInput}
            disabled={isDisabled}
            onChange={(event) => updateSearchInput(event.target.value)}
          />

          <Button type="submit" size="sm" disabled={isDisabled}>
            {UTENTES_PAGE.toolbar.searchSubmitLabel}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isDisabled || !canClearSearch}
            onClick={handleClearSearch}
          >
            {UTENTES_PAGE.toolbar.searchClearLabel}
          </Button>
        </div>
      </form>
    </section>
  );
}
