import { useMemo } from "react";

import FarmaciaRegularizacaoCard from "../FarmaciaRegularizacaoCard/FarmaciaRegularizacaoCard";
import FarmaciaRegularizacoesHistoricoUtenteGroup from "../FarmaciaRegularizacoesHistoricoUtenteGroup/FarmaciaRegularizacoesHistoricoUtenteGroup";
import FarmaciaRegularizacoesState from "../FarmaciaRegularizacoesState/FarmaciaRegularizacoesState";
import FarmaciaRegularizacoesUtenteGroup from "../FarmaciaRegularizacoesUtenteGroup/FarmaciaRegularizacoesUtenteGroup";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import {
  groupHistoricoRegularizacoesByUtente,
  groupRegularizacoesByUtente,
} from "../../utils/farmaciaRegularizacoes.utils";

import Button from "../../../../../shared/ui/Button/Button";

import styles from "./FarmaciaRegularizacoesList.module.css";

function getSectionConfig(variant) {
  if (variant === "history") {
    return FARMACIA_REGULARIZACOES_PAGE.sections.history;
  }

  return FARMACIA_REGULARIZACOES_PAGE.sections.pending;
}

export default function FarmaciaRegularizacoesList({
  regularizacoes = [],
  variant = "pending",
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
}) {
  const sectionConfig = getSectionConfig(variant);
  const hasRegularizacoes = regularizacoes.length > 0;

  const pendingGroups = useMemo(() => {
    if (variant !== "pending") return [];

    return groupRegularizacoesByUtente(regularizacoes);
  }, [regularizacoes, variant]);

  const historyGroups = useMemo(() => {
    if (variant !== "history") return [];

    return groupHistoricoRegularizacoesByUtente(regularizacoes);
  }, [regularizacoes, variant]);

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaRegularizacoesState
          title={sectionConfig.loadingTitle}
          description={sectionConfig.loadingDescription}
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaRegularizacoesState
          title={sectionConfig.errorTitle}
          description={error}
          actionLabel={FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby={`farmacia-regularizacoes-${variant}-title`}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2
            id={`farmacia-regularizacoes-${variant}-title`}
            className={styles.title}
          >
            {sectionConfig.title}
          </h2>

          <p className={styles.description}>{sectionConfig.description}</p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? FARMACIA_REGULARIZACOES_PAGE.actions.refreshing
            : FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
        </Button>
      </header>

      {!hasRegularizacoes ? (
        <FarmaciaRegularizacoesState
          title={sectionConfig.emptyTitle}
          description={sectionConfig.emptyDescription}
        />
      ) : variant === "pending" ? (
        <div className={styles.list}>
          {pendingGroups.map((group) => (
            <FarmaciaRegularizacoesUtenteGroup key={group.id} group={group} />
          ))}
        </div>
      ) : variant === "history" ? (
        <div className={styles.list}>
          {historyGroups.map((group) => (
            <FarmaciaRegularizacoesHistoricoUtenteGroup
              key={group.id}
              group={group}
            />
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          {regularizacoes.map((regularizacao) => (
            <FarmaciaRegularizacaoCard
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
