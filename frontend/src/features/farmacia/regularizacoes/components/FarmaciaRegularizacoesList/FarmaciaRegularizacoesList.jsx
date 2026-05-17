import styles from "./FarmaciaRegularizacoesList.module.css";

import FarmaciaRegularizacaoCard from "../FarmaciaRegularizacaoCard/FarmaciaRegularizacaoCard";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

function FarmaciaRegularizacoesState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.state}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <button type="button" className={styles.stateAction} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

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

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaRegularizacoesState
          title={sectionConfig.loadingTitle}
          description="Aguarda enquanto os dados são carregados."
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

        <button
          type="button"
          className={styles.refreshButton}
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? FARMACIA_REGULARIZACOES_PAGE.actions.refreshing
            : FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
        </button>
      </header>

      {!hasRegularizacoes ? (
        <FarmaciaRegularizacoesState
          title={sectionConfig.emptyTitle}
          description={sectionConfig.emptyDescription}
        />
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
