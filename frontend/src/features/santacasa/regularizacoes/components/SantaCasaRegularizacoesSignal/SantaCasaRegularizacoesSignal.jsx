// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesSignal/SantaCasaRegularizacoesSignal.jsx

import { classNames } from "../../../../../shared/utils/classNames";

import Button from "../../../../../shared/ui/Button/Button";

import styles from "./SantaCasaRegularizacoesSignal.module.css";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  getSignalLatestEventoAtLabel,
  getSignalTotalEventos,
  getSignalTotalUnidades,
} from "../../utils/santaCasaRegularizacoes.utils";

function getReceitasLabel(value) {
  const total = Number(value) || 0;

  return total === 1 ? "receita" : "receitas";
}

function getUnidadesLabel(value) {
  const total = Number(value) || 0;

  return total === 1 ? "unidade" : "unidades";
}

function SignalValue({ value, suffix, muted = false }) {
  const className = classNames(styles.metricValue, muted && styles.metricValueMuted);

  return (
    <strong className={className}>
      <span>{value}</span>
      {suffix ? <small>{suffix}</small> : null}
    </strong>
  );
}

function SantaCasaRegularizacoesSignalState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <section className={styles.section} aria-live="polite">
      <div className={styles.state}>
        <strong className={styles.stateTitle}>{title}</strong>

        {description ? (
          <p className={styles.stateDescription}>{description}</p>
        ) : null}

        {actionLabel && onAction ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </section>
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
      <SantaCasaRegularizacoesSignalState
        title={SANTACASA_REGULARIZACOES_PAGE.sections.signal.loadingTitle}
        description={SANTACASA_REGULARIZACOES_PAGE.sections.signal.description}
      />
    );
  }

  if (error) {
    return (
      <SantaCasaRegularizacoesSignalState
        title={SANTACASA_REGULARIZACOES_PAGE.sections.signal.errorTitle}
        description={error}
        actionLabel={SANTACASA_REGULARIZACOES_PAGE.actions.refresh}
        onAction={onRefresh}
      />
    );
  }

  const totalEventos = getSignalTotalEventos(signal);
  const totalUnidades = getSignalTotalUnidades(signal);
  const latestEventoAt = getSignalLatestEventoAtLabel(signal);

  return (
    <section
      className={styles.section}
      aria-labelledby="santacasa-regularizacoes-signal-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>Rastreabilidade</span>

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

        <Button
          variant="secondary"
          size="sm"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? SANTACASA_REGULARIZACOES_PAGE.actions.refreshing
            : SANTACASA_REGULARIZACOES_PAGE.actions.refresh}
        </Button>
      </header>

      <div className={styles.grid}>
        <article className={classNames(styles.metric, styles.metricPrimary)}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.labels.totalEventos}</span>

          <SignalValue
            value={totalEventos}
            suffix={getReceitasLabel(totalEventos)}
          />
        </article>

        <article className={classNames(styles.metric, styles.metricSuccess)}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.labels.totalUnidades}</span>

          <SignalValue
            value={totalUnidades}
            suffix={getUnidadesLabel(totalUnidades)}
          />
        </article>

        <article className={classNames(styles.metric, styles.metricDate)}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.labels.latestEventoAt}</span>

          <SignalValue value={latestEventoAt} muted />
        </article>
      </div>
    </section>
  );
}
