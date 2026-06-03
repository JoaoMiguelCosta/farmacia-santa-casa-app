// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/SantaCasaRegularizacoesList.jsx

import { useMemo } from "react";

import SantaCasaRegularizacaoCard from "../SantaCasaRegularizacaoCard/SantaCasaRegularizacaoCard";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  groupRegularizacoesByUtente,
  groupRegularizacoesHistoricoByDate,
} from "../../utils/santaCasaRegularizacoes.utils";

import styles from "./SantaCasaRegularizacoesList.module.css";

import SantaCasaRegularizacoesHistoryDateGroup from "./SantaCasaRegularizacoesHistoryDateGroup";
import SantaCasaRegularizacoesPendingGroup from "./SantaCasaRegularizacoesPendingGroup";
import SantaCasaRegularizacoesState from "./SantaCasaRegularizacoesState";

import {
  GROUP_THRESHOLD,
  INITIAL_VISIBLE_HISTORY,
  INITIAL_VISIBLE_MEDICAMENTOS,
  VISIBLE_HISTORY_INCREMENT,
  VISIBLE_MEDICAMENTOS_INCREMENT,
  getSectionConfig,
} from "./santaCasaRegularizacoesList.utils";

import { useRegularizacoesGroupVisibility } from "./useRegularizacoesGroupVisibility";

export default function SantaCasaRegularizacoesList({
  regularizacoes = [],
  variant = "pending",
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
}) {
  const pendingVisibility = useRegularizacoesGroupVisibility({
    initialVisibleCount: INITIAL_VISIBLE_MEDICAMENTOS,
    visibleIncrement: VISIBLE_MEDICAMENTOS_INCREMENT,
  });

  const historyVisibility = useRegularizacoesGroupVisibility({
    initialVisibleCount: INITIAL_VISIBLE_HISTORY,
    visibleIncrement: VISIBLE_HISTORY_INCREMENT,
  });

  const sectionConfig = getSectionConfig(variant);
  const hasRegularizacoes = regularizacoes.length > 0;

  const shouldGroupRegularizacoes =
    variant === "pending" && regularizacoes.length > GROUP_THRESHOLD;

  const groupedRegularizacoes = useMemo(() => {
    if (!shouldGroupRegularizacoes) return [];

    return groupRegularizacoesByUtente(regularizacoes);
  }, [regularizacoes, shouldGroupRegularizacoes]);

  const groupedHistoryRegularizacoes = useMemo(() => {
    if (variant !== "history") return [];

    return groupRegularizacoesHistoricoByDate(regularizacoes);
  }, [regularizacoes, variant]);

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <SantaCasaRegularizacoesState
          title={sectionConfig.loadingTitle}
          description={
            SANTACASA_REGULARIZACOES_PAGE.feedback.loadingDescription
          }
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <SantaCasaRegularizacoesState
          title={sectionConfig.errorTitle}
          description={error}
          actionLabel={SANTACASA_REGULARIZACOES_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby={`santacasa-regularizacoes-${variant}-title`}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2
            id={`santacasa-regularizacoes-${variant}-title`}
            className={styles.title}
          >
            {sectionConfig.title}
          </h2>

          <p className={styles.description}>{sectionConfig.description}</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? SANTACASA_REGULARIZACOES_PAGE.actions.refreshing
            : SANTACASA_REGULARIZACOES_PAGE.actions.refresh}
        </button>
      </header>

      {!hasRegularizacoes ? (
        <SantaCasaRegularizacoesState
          title={sectionConfig.emptyTitle}
          description={sectionConfig.emptyDescription}
        />
      ) : shouldGroupRegularizacoes ? (
        <div className={styles.groups}>
          {groupedRegularizacoes.map((group) => (
            <SantaCasaRegularizacoesPendingGroup
              key={group.key}
              group={group}
              variant={variant}
              isOpen={pendingVisibility.openGroupKeys.has(group.key)}
              visibleCount={pendingVisibility.getVisibleCount(group.key)}
              onToggle={() => pendingVisibility.toggleGroup(group.key)}
              onShowMore={() =>
                pendingVisibility.showMore(
                  group.key,
                  group.regularizacoes.length,
                )
              }
              onShowAll={() =>
                pendingVisibility.showAll(
                  group.key,
                  group.regularizacoes.length,
                )
              }
            />
          ))}
        </div>
      ) : variant === "history" ? (
        <div className={styles.historyContent}>
          {groupedHistoryRegularizacoes.map((group) => (
            <SantaCasaRegularizacoesHistoryDateGroup
              key={group.key}
              group={group}
              isOpen={historyVisibility.openGroupKeys.has(group.key)}
              visibleCount={historyVisibility.getVisibleCount(group.key)}
              onToggle={() => historyVisibility.toggleGroup(group.key)}
              onShowMore={() =>
                historyVisibility.showMore(
                  group.key,
                  group.regularizacoes.length,
                )
              }
              onShowAll={() =>
                historyVisibility.showAll(
                  group.key,
                  group.regularizacoes.length,
                )
              }
            />
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          {regularizacoes.map((regularizacao) => (
            <SantaCasaRegularizacaoCard
              key={regularizacao.id}
              regularizacao={regularizacao}
              variant={variant}
            />
          ))}
        </div>
      )}
    </section>
  );
}
