// src/features/santacasa/operacao/components/OperacaoSelectedUtenteCard/OperacaoSelectedUtenteCard.jsx
import OperacaoUtenteSelector from "../OperacaoUtenteSelector/OperacaoUtenteSelector";

import { OPERACAO_PAGE } from "../../config/operacaoPage.config";

import styles from "./OperacaoSelectedUtenteCard.module.css";

function getSelectedUtenteName(selectedUtente) {
  return selectedUtente?.nome || OPERACAO_PAGE.selectedUtente.titleFallback;
}

function getSelectedUtenteNumber(selectedUtente) {
  return selectedUtente?.numero9 || null;
}

export default function OperacaoSelectedUtenteCard({
  utentes,
  selectedUtenteId,
  selectedUtente,

  isLoadingUtentes = false,
  utentesError = null,
  dataError = null,

  onSelectUtente,
}) {
  const selectedUtenteNumber = getSelectedUtenteNumber(selectedUtente);

  return (
    <section className={styles.card} aria-labelledby="selected-utente-title">
      <header className={styles.header}>
        <div className={styles.identity}>
          <p className={styles.eyebrow}>
            {OPERACAO_PAGE.selectedUtente.eyebrow}
          </p>

          <div className={styles.identityGrid}>
            <div className={styles.identityField}>
              <span>{OPERACAO_PAGE.selectedUtente.nameLabel}</span>

              <h2 id="selected-utente-title" className={styles.title}>
                {getSelectedUtenteName(selectedUtente)}
              </h2>
            </div>

            {selectedUtenteNumber ? (
              <div className={styles.numberCard}>
                <span>{OPERACAO_PAGE.selectedUtente.numberLabel}</span>
                <strong>{selectedUtenteNumber}</strong>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className={styles.selectorPanel}>
        <OperacaoUtenteSelector
          utentes={utentes}
          value={selectedUtenteId}
          onChange={onSelectUtente}
          isLoading={isLoadingUtentes}
          error={utentesError}
        />
      </div>

      {dataError ? (
        <p className={styles.error} role="alert">
          {dataError}
        </p>
      ) : null}
    </section>
  );
}
