import styles from "./FarmaciaPedidosSearch.module.css";

export default function FarmaciaPedidosSearch({
  config,
  searchValue,
  isDisabled = false,
  onSearch,
  onClear,
}) {
  if (!config || !onSearch) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSearch(formData.get("search"));
  }

  const hasActiveSearch = Boolean(String(searchValue || "").trim());

  return (
    <form
      className={styles.searchForm}
      aria-label={config.ariaLabel}
      onSubmit={handleSubmit}
    >
      <label className={styles.searchField}>
        <span>{config.label}</span>

        <input
          key={searchValue}
          type="search"
          name="search"
          defaultValue={searchValue}
          placeholder={config.placeholder}
          disabled={isDisabled}
        />
      </label>

      <div className={styles.searchActions}>
        {hasActiveSearch ? (
          <button
            type="button"
            className={styles.clearButton}
            disabled={isDisabled}
            onClick={onClear}
          >
            {config.clearLabel}
          </button>
        ) : null}

        <button
          type="submit"
          className={styles.searchButton}
          disabled={isDisabled}
        >
          {config.submitLabel}
        </button>
      </div>
    </form>
  );
}
