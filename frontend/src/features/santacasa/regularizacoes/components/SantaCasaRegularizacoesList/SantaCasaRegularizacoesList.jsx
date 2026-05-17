import styles from "./SantaCasaRegularizacoesList.module.css";

import SantaCasaRegularizacaoCard from "../SantaCasaRegularizacaoCard/SantaCasaRegularizacaoCard";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

function SantaCasaRegularizacoesState({
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
    return SANTACASA_REGULARIZACOES_PAGE.sections.history;
  }

  return SANTACASA_REGULARIZACOES_PAGE.sections.pending;
}

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

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <SantaCasaRegularizacoesState
          title={sectionConfig.loadingTitle}
          description="Aguarda enquanto os dados são carregados."
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
