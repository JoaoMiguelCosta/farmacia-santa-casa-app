// src/features/santacasa/operacao/components/OperacaoUtenteCombobox/OperacaoUtenteCombobox.jsx
import { getOptionClassName } from "./operacaoUtenteCombobox.utils";
import { useOperacaoUtenteCombobox } from "./useOperacaoUtenteCombobox";

import styles from "./OperacaoUtenteCombobox.module.css";

export default function OperacaoUtenteCombobox({
  id,
  utentes = [],
  value = "",
  onChange,
  disabled = false,
  placeholder = "Seleciona um utente",
  searchPlaceholder = "Pesquisar...",
  noResultsLabel = "Nenhum resultado encontrado.",
}) {
  const {
    wrapperRef,
    triggerRef,
    searchInputRef,

    isOpen,
    searchTerm,
    activeIndex,

    selectedUtente,
    filteredUtentes,
    hasResults,
    selectedLabel,

    listboxId,
    searchInputId,

    toggleDropdown,
    selectUtente,
    handleSearchChange,
    handleTriggerKeyDown,
    handleSearchKeyDown,
    setActiveIndex,
  } = useOperacaoUtenteCombobox({
    id,
    utentes,
    value,
    onChange,
    disabled,
    placeholder,
  });

  return (
    <div ref={wrapperRef} className={styles.combobox}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={styles.trigger}
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
      >
        <span
          className={
            selectedUtente ? styles.triggerValue : styles.triggerPlaceholder
          }
        >
          {selectedLabel}
        </span>

        <span className={styles.triggerIcon} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className={styles.dropdown}>
          <div className={styles.searchWrap}>
            <input
              ref={searchInputRef}
              id={searchInputId}
              type="search"
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              autoComplete="off"
            />
          </div>

          <div id={listboxId} className={styles.options} role="listbox">
            {hasResults ? (
              filteredUtentes.map((utente, index) => {
                const isSelected = utente.id === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={utente.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={getOptionClassName({
                      styles,
                      isSelected,
                      isActive,
                    })}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectUtente(utente)}
                  >
                    <span className={styles.optionName}>{utente.nome}</span>

                    <span className={styles.optionNumber}>
                      N.º utente {utente.numero9}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className={styles.empty}>{noResultsLabel}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
