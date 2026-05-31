// src/features/santacasa/operacao/components/OperacaoSelectedUtenteCard/OperacaoSelectedUtenteCard.jsx
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import UtenteSelector from "../../../shared/components/UtenteSelector/UtenteSelector";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";

import styles from "./OperacaoSelectedUtenteCard.module.css";

function getSelectedUtenteDescription(selectedUtente) {
  if (!selectedUtente) {
    return OPERACAO_PAGE.selectedUtente.descriptionFallback;
  }

  return `${OPERACAO_PAGE.selectedUtente.numberLabel}: ${selectedUtente.numero9}`;
}

export default function OperacaoSelectedUtenteCard({
  utentes,
  selectedUtenteId,
  selectedUtente,

  receitasCount = 0,
  semReceitaCount = 0,
  extrasCount = 0,
  pedidoDraftCount = 0,

  isLoadingUtentes = false,
  utentesError = null,
  dataError = null,

  onSelectUtente,
}) {
  return (
    <SurfaceCard
      eyebrow={OPERACAO_PAGE.selectedUtente.eyebrow}
      title={selectedUtente?.nome || OPERACAO_PAGE.selectedUtente.titleFallback}
      description={getSelectedUtenteDescription(selectedUtente)}
      tone="green"
    >
      <UtenteSelector
        utentes={utentes}
        value={selectedUtenteId}
        onChange={onSelectUtente}
        isLoading={isLoadingUtentes}
        error={utentesError}
      />

      {dataError ? (
        <p className={styles.error} role="alert">
          {dataError}
        </p>
      ) : null}

      {selectedUtente ? (
        <div
          className={styles.summary}
          aria-label={OPERACAO_PAGE.summary.ariaLabel}
          role="list"
        >
          <article role="listitem">
            <strong>{receitasCount}</strong>
            <span>{OPERACAO_PAGE.summary.receitasLabel}</span>
          </article>

          <article role="listitem">
            <strong>{semReceitaCount}</strong>
            <span>{OPERACAO_PAGE.summary.semReceitaLabel}</span>
          </article>

          <article role="listitem">
            <strong>{extrasCount}</strong>
            <span>{OPERACAO_PAGE.summary.extrasLabel}</span>
          </article>

          <article role="listitem">
            <strong>{pedidoDraftCount}</strong>
            <span>{OPERACAO_PAGE.summary.pedidoDraftLabel}</span>
          </article>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
