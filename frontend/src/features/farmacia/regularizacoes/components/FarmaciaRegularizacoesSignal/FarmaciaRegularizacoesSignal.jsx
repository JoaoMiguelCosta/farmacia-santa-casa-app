import FarmaciaRegularizacoesState from "../FarmaciaRegularizacoesState/FarmaciaRegularizacoesState";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import {
  getSignalLatestEventoAtLabel,
  getSignalTotalEventos,
  getSignalTotalUnidades,
} from "../../utils/farmaciaRegularizacoes.utils";

import styles from "./FarmaciaRegularizacoesSignal.module.css";

export default function FarmaciaRegularizacoesSignal({
  signal = null,
  isLoading = false,
  error = null,
  isRefreshing = false,
  onRefresh,
}) {
  const sectionConfig = FARMACIA_REGULARIZACOES_PAGE.sections.signal;

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaRegularizacoesState
          title={sectionConfig.loadingTitle}
          description={sectionConfig.loadingDescription}
          variant="embedded"
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
          variant="embedded"
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
