import { Link } from "react-router-dom";

import styles from "./FarmaciaDashboardSignals.module.css";

import { FARMACIA_DASHBOARD_PAGE } from "../../config/farmaciaDashboardPage.config";

import {
  buildDashboardMetrics,
  buildRegularizacoesMetrics,
  getLatestPedidoCreatedAtLabel,
  getLatestPedidoDecisionAtLabel,
  getLatestPedidoDecisionLabel,
  getLatestPedidoNumberLabel,
  getLatestPedidoStatusLabel,
  hasLatestPedido,
} from "../../utils/farmaciaDashboard.utils";

function DashboardState({ title, description, actionLabel, onAction }) {
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

function MetricCard({ metric }) {
  const content = (
    <>
      <span className={styles.metricLabel}>{metric.label}</span>
      <strong className={styles.metricValue}>{metric.value}</strong>
    </>
  );

  if (metric.to) {
    return (
      <Link className={styles.metricCard} to={metric.to}>
        {content}
      </Link>
    );
  }

  return <article className={styles.metricCard}>{content}</article>;
}

function LatestPedido({ dashboard }) {
  if (!hasLatestPedido(dashboard)) {
    return (
      <article className={styles.latestCard}>
        <span className={styles.latestEyebrow}>
          {FARMACIA_DASHBOARD_PAGE.labels.latestPedido}
        </span>

        <strong className={styles.latestTitle}>Sem pedidos registados</strong>

        <p className={styles.latestText}>
          Quando existir atividade, o último pedido aparece aqui.
        </p>
      </article>
    );
  }

  return (
    <article className={styles.latestCard}>
      <div className={styles.latestHeader}>
        <div>
          <span className={styles.latestEyebrow}>
            {FARMACIA_DASHBOARD_PAGE.labels.latestPedido}
          </span>

          <strong className={styles.latestTitle}>
            {getLatestPedidoNumberLabel(dashboard)}
          </strong>
        </div>

        <span className={styles.latestStatus}>
          {getLatestPedidoStatusLabel(dashboard)}
        </span>
      </div>

      <dl className={styles.latestMeta}>
        <div>
          <dt>{FARMACIA_DASHBOARD_PAGE.labels.createdAt}</dt>
          <dd>{getLatestPedidoCreatedAtLabel(dashboard)}</dd>
        </div>

        <div>
          <dt>{getLatestPedidoDecisionLabel(dashboard)}</dt>
          <dd>{getLatestPedidoDecisionAtLabel(dashboard)}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function FarmaciaDashboardSignals({
  dashboard = null,
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
}) {
  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <DashboardState
          title={FARMACIA_DASHBOARD_PAGE.sections.signals.loadingTitle}
          description="Aguarda enquanto os sinais operacionais são carregados."
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <DashboardState
          title={FARMACIA_DASHBOARD_PAGE.sections.signals.errorTitle}
          description={error}
          actionLabel={FARMACIA_DASHBOARD_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  const mainMetrics = buildDashboardMetrics(dashboard);
  const regularizacoesMetrics = buildRegularizacoesMetrics(dashboard);

  return (
    <section
      className={styles.section}
      aria-labelledby="farmacia-dashboard-signals-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id="farmacia-dashboard-signals-title" className={styles.title}>
            {FARMACIA_DASHBOARD_PAGE.sections.signals.title}
          </h2>

          <p className={styles.description}>
            {FARMACIA_DASHBOARD_PAGE.sections.signals.description}
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? FARMACIA_DASHBOARD_PAGE.actions.refreshing
            : FARMACIA_DASHBOARD_PAGE.actions.refresh}
        </button>
      </header>

      <div className={styles.grid}>
        <div className={styles.metrics}>
          {mainMetrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>

        <LatestPedido dashboard={dashboard} />
      </div>

      <div className={styles.secondaryMetrics}>
        {regularizacoesMetrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>
    </section>
  );
}
