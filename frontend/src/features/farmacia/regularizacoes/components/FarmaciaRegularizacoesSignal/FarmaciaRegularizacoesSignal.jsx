import styles from "./FarmaciaRegularizacoesSignal.module.css";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import {
  getSignalLatestEventoAtLabel,
  getSignalTotalEventos,
  getSignalTotalUnidades,
} from "../../utils/farmaciaRegularizacoes.utils";

function FarmaciaRegularizacoesSignalState({
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

export default function FarmaciaRegularizacoesSignal({
  signal = null,
  isLoading = false,
  error = null,
  isRefreshing = false,
  onRefresh,
}) {
  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaRegularizacoesSignalState
          title={FARMACIA_REGULARIZACOES_PAGE.sections.signal.loadingTitle}
          description="Aguarda enquanto o resumo é carregado."
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaRegularizacoesSignalState
          title={FARMACIA_REGULARIZACOES_PAGE.sections.signal.errorTitle}
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
      aria-labelledby="farmacia-regularizacoes-signal-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2
            id="farmacia-regularizacoes-signal-title"
            className={styles.title}
          >
            {FARMACIA_REGULARIZACOES_PAGE.sections.signal.title}
          </h2>

          <p className={styles.description}>
            {FARMACIA_REGULARIZACOES_PAGE.sections.signal.description}
          </p>
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

      <div className={styles.grid}>
        <article className={styles.metric}>
          <span>{FARMACIA_REGULARIZACOES_PAGE.labels.totalEventos}</span>
          <strong>{getSignalTotalEventos(signal)}</strong>
        </article>

        <article className={styles.metric}>
          <span>{FARMACIA_REGULARIZACOES_PAGE.labels.totalUnidades}</span>
          <strong>{getSignalTotalUnidades(signal)}</strong>
        </article>

        <article className={styles.metric}>
          <span>{FARMACIA_REGULARIZACOES_PAGE.labels.latestEventoAt}</span>
          <strong>{getSignalLatestEventoAtLabel(signal)}</strong>
        </article>
      </div>
    </section>
  );
}
