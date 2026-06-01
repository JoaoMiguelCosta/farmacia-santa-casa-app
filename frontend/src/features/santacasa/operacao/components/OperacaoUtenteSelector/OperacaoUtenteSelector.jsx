// src/features/santacasa/operacao/components/OperacaoUtenteSelector/OperacaoUtenteSelector.jsx
import FormField from "../../../../../shared/ui/FormField/FormField";

import { OPERACAO_UTENTE_SELECTOR } from "../../config/operacaoUtenteSelector.config";

import OperacaoUtenteCombobox from "../OperacaoUtenteCombobox/OperacaoUtenteCombobox";

import styles from "./OperacaoUtenteSelector.module.css";

function getSelectorHint({ isLoading, hasUtentes }) {
  if (isLoading) {
    return OPERACAO_UTENTE_SELECTOR.field.loadingHint;
  }

  if (!hasUtentes) {
    return OPERACAO_UTENTE_SELECTOR.field.emptyHint;
  }

  return OPERACAO_UTENTE_SELECTOR.field.defaultHint;
}

function getPlaceholderLabel(hasUtentes) {
  return hasUtentes
    ? OPERACAO_UTENTE_SELECTOR.field.placeholder
    : OPERACAO_UTENTE_SELECTOR.field.emptyPlaceholder;
}

export default function OperacaoUtenteSelector({
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
      aria-labelledby={OPERACAO_UTENTE_SELECTOR.titleId}
    >
      <header className={styles.header}>
        <h3 id={OPERACAO_UTENTE_SELECTOR.titleId} className={styles.title}>
          {OPERACAO_UTENTE_SELECTOR.title}
        </h3>

        <p className={styles.description}>
          {OPERACAO_UTENTE_SELECTOR.description}
        </p>
      </header>

      <FormField
        id={OPERACAO_UTENTE_SELECTOR.field.id}
        label={OPERACAO_UTENTE_SELECTOR.field.label}
        hint={hint}
        error={error}
        required
      >
        <OperacaoUtenteCombobox
          id={OPERACAO_UTENTE_SELECTOR.field.id}
          utentes={utentes}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          placeholder={getPlaceholderLabel(hasUtentes)}
          searchPlaceholder={OPERACAO_UTENTE_SELECTOR.field.searchPlaceholder}
          noResultsLabel={OPERACAO_UTENTE_SELECTOR.field.noResultsLabel}
        />
      </FormField>
    </section>
  );
}
