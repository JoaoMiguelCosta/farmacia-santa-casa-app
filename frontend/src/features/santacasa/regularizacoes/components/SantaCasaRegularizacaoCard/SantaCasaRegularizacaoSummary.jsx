// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoSummary.jsx

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import { classNames } from "../../../../../shared/utils/classNames";

import {
  getRegularizacaoEventosCount,
  getRegularizacaoQuantidadeRegularizada,
  getRegularizacaoQuantidadeRestante,
  getRegularizacaoQuantidadeSolicitada,
} from "../../utils/santaCasaRegularizacoes.utils";

import SantaCasaRegularizacaoUnitValue from "./SantaCasaRegularizacaoUnitValue";

import styles from "./SantaCasaRegularizacaoSummary.module.css";

function getOperationalSummaryClassName(isHistory) {
  return classNames(styles.operationalSummary, isHistory && styles.operationalSummaryHistory);
}

function getFocusMetricClassName(isCompleted) {
  return classNames(styles.focusMetric, isCompleted && styles.focusMetricCompleted);
}

function getContextListClassName(isHistory) {
  return classNames(styles.contextList, isHistory && styles.contextListHistory);
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
      aria-label={SANTACASA_REGULARIZACOES_PAGE.labels.summaryAriaLabel}
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
