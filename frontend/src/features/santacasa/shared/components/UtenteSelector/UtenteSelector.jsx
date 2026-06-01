// src/features/santacasa/shared/components/UtenteSelector/UtenteSelector.jsx
import FormField from "../../../../../shared/ui/FormField/FormField";

import { UTENTE_SELECTOR } from "../../config/utenteSelector.config";

import UtenteCombobox from "../UtenteCombobox/UtenteCombobox";

import styles from "./UtenteSelector.module.css";

function getSelectorHint({ isLoading, hasUtentes }) {
  if (isLoading) {
    return UTENTE_SELECTOR.field.loadingHint;
  }

  if (!hasUtentes) {
    return UTENTE_SELECTOR.field.emptyHint;
  }

  return UTENTE_SELECTOR.field.defaultHint;
}

function getPlaceholderLabel(hasUtentes) {
  return hasUtentes
    ? UTENTE_SELECTOR.field.placeholder
    : UTENTE_SELECTOR.field.emptyPlaceholder;
}

export default function UtenteSelector({
  utentes = [],
  value = "",
  onChange,
  isLoading = false,
  error = null,
}) {
  const hasUtentes = utentes.length > 0;
  const isDisabled = isLoading || !hasUtentes;

  const hint = getSelectorHint({
    isLoading,
    hasUtentes,
  });

  return (
    <section
      className={styles.selector}
      aria-labelledby={UTENTE_SELECTOR.titleId}
    >
      <header className={styles.header}>
        <h3 id={UTENTE_SELECTOR.titleId} className={styles.title}>
          {UTENTE_SELECTOR.title}
        </h3>

        <p className={styles.description}>{UTENTE_SELECTOR.description}</p>
      </header>

      <FormField
        id={UTENTE_SELECTOR.field.id}
        label={UTENTE_SELECTOR.field.label}
        hint={hint}
        error={error}
        required
      >
        <UtenteCombobox
          id={UTENTE_SELECTOR.field.id}
          utentes={utentes}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          placeholder={getPlaceholderLabel(hasUtentes)}
          searchPlaceholder={UTENTE_SELECTOR.field.searchPlaceholder}
          noResultsLabel={UTENTE_SELECTOR.field.noResultsLabel}
        />
      </FormField>
    </section>
  );
}
