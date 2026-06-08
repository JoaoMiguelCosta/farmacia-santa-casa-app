// src/features/farmacia/historico/components/FarmaciaHistoricoFilters/FarmaciaHistoricoFilters.jsx
import styles from "./FarmaciaHistoricoFilters.module.css";

const DATE_RANGE_ERROR_ID = "farmacia-historico-date-range-error";

function getTotalLabel(total, config) {
  return total === 1 ? config.totalSingular : config.totalPlural;
}

function hasInvalidDateRange(fromInput, toInput) {
  if (!fromInput || !toInput) {
    return false;
  }

  /*
   * Os inputs type="date" devolvem YYYY-MM-DD.
   * Nesse formato, a comparação alfabética também
   * corresponde à ordem cronológica.
   */
  return fromInput > toInput;
}

export default function FarmaciaHistoricoFilters({
  config,
  total = 0,
  selectedStatus = "TODOS",

  searchInput = "",
  fromInput = "",
  toInput = "",

  isDisabled = false,

  onStatusChange,
  onSearchChange,
  onFromChange,
  onToChange,

  onSubmit,
  onClear,
}) {
  if (!config) return null;

  const safeTotal = Math.max(0, Number(total) || 0);

  const isDateRangeInvalid = hasInvalidDateRange(fromInput, toInput);

  const isSubmitDisabled = isDisabled || isDateRangeInvalid;

  function handleSubmit(event) {
    event.preventDefault();

    if (isDateRangeInvalid) {
      return;
    }

    onSubmit?.();
  }

  return (
    <section className={styles.filters} aria-label={config.ariaLabel}>
      <div className={styles.statusRow}>
        <div className={styles.statusGroup}>
          <span className={styles.groupLabel}>{config.statusLabel}</span>

          <div
            className={styles.statusOptions}
            role="group"
            aria-label={config.statusLabel}
          >
            {config.options.map((option) => {
              const isActive = selectedStatus === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={styles.statusButton}
                  data-status={option.value}
                  data-active={isActive ? "true" : "false"}
                  aria-pressed={isActive}
                  disabled={isDisabled}
                  onClick={() => {
                    onStatusChange?.(option.value);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.total} role="status" aria-live="polite">
          <strong>{safeTotal}</strong>

          <span>{getTotalLabel(safeTotal, config)}</span>
        </div>
      </div>

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <label className={styles.searchField}>
          <span>{config.searchLabel}</span>

          <input
            type="search"
            value={searchInput}
            placeholder={config.searchPlaceholder}
            disabled={isDisabled}
            onChange={(event) => {
              onSearchChange?.(event.target.value);
            }}
          />
        </label>

        <label className={styles.dateField}>
          <span>{config.fromLabel}</span>

          <input
            type="date"
            value={fromInput}
            max={toInput || undefined}
            aria-invalid={isDateRangeInvalid}
            aria-describedby={
              isDateRangeInvalid ? DATE_RANGE_ERROR_ID : undefined
            }
            disabled={isDisabled}
            onChange={(event) => {
              onFromChange?.(event.target.value);
            }}
          />
        </label>

        <label className={styles.dateField}>
          <span>{config.toLabel}</span>

          <input
            type="date"
            value={toInput}
            min={fromInput || undefined}
            aria-invalid={isDateRangeInvalid}
            aria-describedby={
              isDateRangeInvalid ? DATE_RANGE_ERROR_ID : undefined
            }
            disabled={isDisabled}
            onChange={(event) => {
              onToChange?.(event.target.value);
            }}
          />
        </label>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.clearButton}
            disabled={isDisabled}
            onClick={onClear}
          >
            {config.clear}
          </button>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitDisabled}
          >
            {config.submit}
          </button>
        </div>

        {isDateRangeInvalid ? (
          <p id={DATE_RANGE_ERROR_ID} className={styles.dateError} role="alert">
            {config.validation.dateRange}
          </p>
        ) : null}
      </form>
    </section>
  );
}
