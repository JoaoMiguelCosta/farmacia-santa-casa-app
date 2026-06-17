import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import styles from "./FarmaciaRegularizacaoCard.module.css";

export default function FarmaciaRegularizacaoProgress({ progressPercent = 0 }) {
  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressHeader}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.progresso}</span>
        <strong>{progressPercent}%</strong>
      </div>

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
      >
        <span
          className={styles.progressBar}
          style={{ "--progress-value": `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
