// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoSituation.jsx

import {
  getRegularizacaoSituationDescription,
  getRegularizacaoSituationTitle,
} from "../../utils/santaCasaRegularizacoes.utils";

import styles from "./SantaCasaRegularizacaoSituation.module.css";

function getSituationClassName(isCompleted) {
  return isCompleted
    ? `${styles.situation} ${styles.situationCompleted}`
    : `${styles.situation} ${styles.situationPending}`;
}

export default function SantaCasaRegularizacaoSituation({
  regularizacao,
  isCompleted,
}) {
  return (
    <div className={getSituationClassName(isCompleted)}>
      <strong>{getRegularizacaoSituationTitle(regularizacao)}</strong>
      <span>{getRegularizacaoSituationDescription(regularizacao)}</span>
    </div>
  );
}
