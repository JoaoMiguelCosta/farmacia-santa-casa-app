// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoSummary.jsx

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  getRegularizacaoEventosCount,
  getRegularizacaoQuantidadeRegularizada,
  getRegularizacaoQuantidadeRestante,
  getRegularizacaoQuantidadeSolicitada,
} from "../../utils/santaCasaRegularizacoes.utils";

import SantaCasaRegularizacaoUnitValue from "./SantaCasaRegularizacaoUnitValue";

import styles from "./SantaCasaRegularizacaoSummary.module.css";

function getOperationalSummaryClassName(isHistory) {
  return isHistory
    ? `${styles.operationalSummary} ${styles.operationalSummaryHistory}`
    : styles.operationalSummary;
}

function getFocusMetricClassName(isCompleted) {
  return isCompleted
    ? `${styles.focusMetric} ${styles.focusMetricCompleted}`
    : styles.focusMetric;
}

function getContextListClassName(isHistory) {
  return isHistory
    ? `${styles.contextList} ${styles.contextListHistory}`
    : styles.contextList;
}

export default function SantaCasaRegularizacaoSummary({
  regularizacao,
  isCompleted,
  isHistory,
}) {
  const quantidadeSolicitada =
    getRegularizacaoQuantidadeSolicitada(regularizacao);
  const quantidadeRegularizada =
    getRegularizacaoQuantidadeRegularizada(regularizacao);
  const quantidadeRestante = getRegularizacaoQuantidadeRestante(regularizacao);
  const eventosCount = getRegularizacaoEventosCount(regularizacao);

  return (
    <section
      className={getOperationalSummaryClassName(isHistory)}
      aria-label="Resumo da regularização"
    >
      {!isHistory ? (
        <div className={getFocusMetricClassName(isCompleted)}>
          <span className={styles.focusMetricLabel}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.quantidadeRestante}
          </span>

          <SantaCasaRegularizacaoUnitValue
            value={quantidadeRestante}
            variant="featured"
          />
        </div>
      ) : null}

      <dl className={getContextListClassName(isHistory)}>
        {!isHistory ? (
          <div>
            <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.quantidadeSolicitada}</dt>
            <dd>
              <SantaCasaRegularizacaoUnitValue value={quantidadeSolicitada} />
            </dd>
          </div>
        ) : null}

        <div className={styles.contextMetricRegularized}>
          <dt>
            {isHistory
              ? SANTACASA_REGULARIZACOES_PAGE.labels.unidadesRegularizadas
              : SANTACASA_REGULARIZACOES_PAGE.labels.quantidadeRegularizada}
          </dt>
          <dd>
            <SantaCasaRegularizacaoUnitValue
              value={quantidadeRegularizada}
              tone="success"
            />
          </dd>
        </div>

        <div>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.eventos}</dt>
          <dd>{eventosCount}</dd>
        </div>
      </dl>
    </section>
  );
}
