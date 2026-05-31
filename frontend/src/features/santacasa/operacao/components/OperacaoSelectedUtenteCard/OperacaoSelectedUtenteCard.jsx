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
    </SurfaceCard>
  );
}
