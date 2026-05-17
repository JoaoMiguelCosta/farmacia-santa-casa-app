import styles from "./SantaCasaRegularizacoesSignal.module.css";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  getSignalLatestEventoAtLabel,
  getSignalTotalEventos,
  getSignalTotalUnidades,
} from "../../utils/santaCasaRegularizacoes.utils";

function SantaCasaRegularizacoesSignalState({
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

export default function SantaCasaRegularizacoesSignal({
  signal = null,
  isLoading = false,
  error = null,
  isRefreshing = false,
  onRefresh,
}) {
  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <SantaCasaRegularizacoesSignalState
          title={SANTACASA_REGULARIZACOES_PAGE.sections.signal.loadingTitle}
          description="Aguarda enquanto o resumo é carregado."
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <SantaCasaRegularizacoesSignalState
          title={SANTACASA_REGULARIZACOES_PAGE.sections.signal.errorTitle}
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
      aria-labelledby="santacasa-regularizacoes-signal-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2
            id="santacasa-regularizacoes-signal-title"
            className={styles.title}
          >
            {SANTACASA_REGULARIZACOES_PAGE.sections.signal.title}
          </h2>

          <p className={styles.description}>
            {SANTACASA_REGULARIZACOES_PAGE.sections.signal.description}
          </p>
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

      <div className={styles.grid}>
        <article className={styles.metric}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.labels.totalEventos}</span>
          <strong>{getSignalTotalEventos(signal)}</strong>
        </article>

        <article className={styles.metric}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.labels.totalUnidades}</span>
          <strong>{getSignalTotalUnidades(signal)}</strong>
        </article>

        <article className={styles.metric}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.labels.latestEventoAt}</span>
          <strong>{getSignalLatestEventoAtLabel(signal)}</strong>
        </article>
      </div>
    </section>
  );
}
