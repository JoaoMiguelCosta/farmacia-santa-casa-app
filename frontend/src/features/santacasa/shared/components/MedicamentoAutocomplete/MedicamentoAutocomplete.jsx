// src/features/santacasa/shared/components/MedicamentoAutocomplete/MedicamentoAutocomplete.jsx
import FormField from "../../../../../shared/ui/FormField/FormField";

import { MEDICAMENTO_AUTOCOMPLETE_CONFIG } from "./MedicamentoAutocomplete.config";
import {
  getOptionClassName,
  getOptionElementId,
} from "./medicamentoAutocomplete.utils";
import { useMedicamentoAutocomplete } from "./useMedicamentoAutocomplete";

import styles from "./MedicamentoAutocomplete.module.css";

export default function MedicamentoAutocomplete({
  id,
  label,
  hint,
  error,
  value = "",
  placeholder,
  options = [],
  disabled = false,
  required = false,
  noResultsLabel = MEDICAMENTO_AUTOCOMPLETE_CONFIG.noResultsLabel,
  onChange,
}) {
  const {
    wrapperRef,
    inputRef,

    isOpen,
    filteredOptions,
    hasOptions,
    hasResults,
    resolvedActiveIndex,
    listboxId,

    handleInputChange,
    handleInputFocus,
    handleInputKeyDown,
    handleOptionSelect,
    handleToggleMouseDown,
    toggleDropdown,
    setActiveIndex,
  } = useMedicamentoAutocomplete({
    id,
    value,
    options,
    disabled,
    onChange,
  });

  const activeOptionElementId =
    isOpen && resolvedActiveIndex >= 0
      ? getOptionElementId({
          listboxId,
          index: resolvedActiveIndex,
        })
      : undefined;

  const toggleLabel = isOpen
    ? MEDICAMENTO_AUTOCOMPLETE_CONFIG.closeOptionsLabel
    : MEDICAMENTO_AUTOCOMPLETE_CONFIG.openOptionsLabel;

  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <div className={styles.field} ref={wrapperRef}>
        <div className={styles.inputWrap}>
          <input
            ref={inputRef}
            id={id}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={hasOptions ? listboxId : undefined}
            aria-activedescendant={activeOptionElementId}
          />

          <button
            type="button"
            className={styles.toggleButton}
            aria-label={toggleLabel}
            aria-expanded={isOpen}
            aria-controls={hasOptions ? listboxId : undefined}
            disabled={disabled || !hasOptions}
            onMouseDown={handleToggleMouseDown}
            onClick={toggleDropdown}
          >
            <span aria-hidden="true">⌄</span>
          </button>
        </div>

        {isOpen && hasOptions ? (
          <div
            id={listboxId}
            className={styles.dropdown}
            role="listbox"
            aria-label={label}
          >
            {hasResults ? (
              filteredOptions.map((option, index) => {
                const isActive = index === resolvedActiveIndex;
                const optionElementId = getOptionElementId({
                  listboxId,
                  index,
                });

                return (
                  <button
                    key={optionElementId}
                    id={optionElementId}
                    type="button"
                    className={getOptionClassName({ styles, isActive })}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleOptionSelect(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className={styles.optionName}>{option.label}</span>
                  </button>
                );
              })
            ) : (
              <p className={styles.empty} role="status">
                {noResultsLabel}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
