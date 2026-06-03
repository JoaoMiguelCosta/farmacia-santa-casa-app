// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/SantaCasaRegularizacoesHistoryDateGroup.jsx

import SantaCasaRegularizacaoCard from "../SantaCasaRegularizacaoCard/SantaCasaRegularizacaoCard";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import styles from "./SantaCasaRegularizacoesList.module.css";

import {
  getHistoryHiddenLabel,
  getReceitasUsadasShortLabel,
  getRegularizacoesConcluidasShortLabel,
  getUnidadesRegularizadasShortLabel,
  getViewMoreRegularizacoesLabel,
} from "./santaCasaRegularizacoesList.utils";

export default function SantaCasaRegularizacoesHistoryDateGroup({
  group,
  isOpen,
  visibleCount,
  onToggle,
  onShowMore,
  onShowAll,
}) {
  const panelId = `santacasa-regularizacoes-history-group-${group.key}`;
  const totalRegularizacoes = group.regularizacoes.length;
  const safeVisibleCount = Math.min(visibleCount, totalRegularizacoes);
  const visibleRegularizacoes = group.regularizacoes.slice(0, safeVisibleCount);

  const hasHiddenRegularizacoes = safeVisibleCount < totalRegularizacoes;
  const hiddenRegularizacoesCount = totalRegularizacoes - safeVisibleCount;

  return (
    <article className={`${styles.group} ${styles.historyGroup}`}>
      <header className={`${styles.groupHeader} ${styles.groupHeaderHistory}`}>
        <div className={styles.groupIdentity}>
          <span className={styles.groupEyebrow}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.date}
          </span>

          <strong className={styles.groupTitle}>{group.dateLabel}</strong>

          <span className={styles.groupDescription}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.historyDateDescription}
          </span>
        </div>

        <dl className={`${styles.groupStats} ${styles.groupStatsWide}`}>
          <div>
            <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.regularizacoesShort}</dt>
            <dd>
              {getRegularizacoesConcluidasShortLabel(totalRegularizacoes)}
            </dd>
          </div>

          <div>
            <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.unidadesShort}</dt>
            <dd>
              {getUnidadesRegularizadasShortLabel(group.totalRegularizada)}
            </dd>
          </div>

          <div>
            <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.receitasShort}</dt>
            <dd>{getReceitasUsadasShortLabel(group.totalEventos)}</dd>
          </div>
        </dl>

        <button
          type="button"
          className={styles.groupButton}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          {isOpen
            ? SANTACASA_REGULARIZACOES_PAGE.actions.hideRegularizacoes
            : SANTACASA_REGULARIZACOES_PAGE.actions.viewRegularizacoes}
        </button>
      </header>

      {isOpen ? (
        <div id={panelId} className={styles.groupContent}>
          <div className={styles.groupList}>
            {visibleRegularizacoes.map((regularizacao) => (
              <SantaCasaRegularizacaoCard
                key={regularizacao.id}
                regularizacao={regularizacao}
                variant="history"
              />
            ))}
          </div>

          <footer className={styles.groupPagination}>
            <span className={styles.groupPaginationInfo}>
              {hasHiddenRegularizacoes
                ? getHistoryHiddenLabel(hiddenRegularizacoesCount)
                : "Todas as regularizações deste dia estão visíveis."}
            </span>

            <div className={styles.groupPaginationActions}>
              {hasHiddenRegularizacoes ? (
                <>
                  <button
                    type="button"
                    className={styles.groupSecondaryButton}
                    onClick={onShowMore}
                  >
                    {getViewMoreRegularizacoesLabel(hiddenRegularizacoesCount)}
                  </button>

                  <button
                    type="button"
                    className={styles.groupSecondaryButton}
                    onClick={onShowAll}
                  >
                    {
                      SANTACASA_REGULARIZACOES_PAGE.actions
                        .viewAllRegularizacoes
                    }
                  </button>
                </>
              ) : null}

              <button
                type="button"
                className={styles.groupSecondaryButton}
                onClick={onToggle}
              >
                {SANTACASA_REGULARIZACOES_PAGE.actions.hideRegularizacoes}
              </button>
            </div>
          </footer>
        </div>
      ) : null}
    </article>
  );
}
