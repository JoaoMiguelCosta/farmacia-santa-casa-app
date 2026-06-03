// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoProgress.jsx

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  getRegularizacaoProgressPercent,
  getRegularizacaoQuantidadeRegularizada,
  getRegularizacaoQuantidadeSolicitada,
} from "../../utils/santaCasaRegularizacoes.utils";

import styles from "./SantaCasaRegularizacaoProgress.module.css";

export default function SantaCasaRegularizacaoProgress({ regularizacao }) {
  const progressPercent = getRegularizacaoProgressPercent(regularizacao);
  const quantidadeSolicitada =
    getRegularizacaoQuantidadeSolicitada(regularizacao);
  const quantidadeRegularizada =
    getRegularizacaoQuantidadeRegularizada(regularizacao);

  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressHeader}>
        <span>{SANTACASA_REGULARIZACOES_PAGE.labels.progress}</span>

        <strong>
          {quantidadeRegularizada}/{quantidadeSolicitada} · {progressPercent}%
        </strong>
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
