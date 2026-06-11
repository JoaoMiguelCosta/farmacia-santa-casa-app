// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/SantaCasaRegularizacoesList.jsx

import { useMemo } from "react";

import SantaCasaRegularizacaoCard from "../SantaCasaRegularizacaoCard/SantaCasaRegularizacaoCard";
import SantaCasaRegularizacoesHistoricoUtenteGroup from "../SantaCasaRegularizacoesHistoricoUtenteGroup/SantaCasaRegularizacoesHistoricoUtenteGroup";
import SantaCasaRegularizacoesUtenteGroup from "../SantaCasaRegularizacoesUtenteGroup/SantaCasaRegularizacoesUtenteGroup";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  groupHistoricoRegularizacoesByUtente,
  groupRegularizacoesByUtente,
} from "../../utils/santaCasaRegularizacoes.utils";

import styles from "./SantaCasaRegularizacoesList.module.css";

import SantaCasaRegularizacoesState from "./SantaCasaRegularizacoesState";

import { getSectionConfig } from "./santaCasaRegularizacoesList.utils";

export default function SantaCasaRegularizacoesList({
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
      ) : variant === "pending" ? (
        <div className={styles.groups}>
          {pendingGroups.map((group) => (
            <SantaCasaRegularizacoesUtenteGroup key={group.key} group={group} />
          ))}
        </div>
      ) : variant === "history" ? (
        <div className={styles.groups}>
          {historyGroups.map((group) => (
            <SantaCasaRegularizacoesHistoricoUtenteGroup
              key={group.key}
              group={group}
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
