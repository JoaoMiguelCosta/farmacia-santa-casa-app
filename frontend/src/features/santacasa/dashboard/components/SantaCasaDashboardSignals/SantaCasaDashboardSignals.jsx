import { Link } from "react-router-dom";

import styles from "./SantaCasaDashboardSignals.module.css";

import { SANTACASA_DASHBOARD_PAGE } from "../../config/santaCasaDashboardPage.config";

import {
  buildDashboardMainMetrics,
  buildExtrasMetrics,
  buildPedidosMetrics,
  buildReceitasMetrics,
  buildRegularizacoesMetrics,
  getLatestPedidoCreatedAtLabel,
  getLatestPedidoDecisionAtLabel,
  getLatestPedidoDecisionLabel,
  getLatestPedidoNumberLabel,
  getLatestPedidoStatusLabel,
  hasLatestPedido,
} from "../../utils/santaCasaDashboard.utils";

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

function MetricsGroup({ title, metrics = [] }) {
  if (!Array.isArray(metrics) || metrics.length === 0) return null;

  return (
    <section className={styles.group} aria-label={title}>
      <h3 className={styles.groupTitle}>{title}</h3>

      <div className={styles.groupGrid}>
        {metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>
    </section>
  );
}

function LatestPedido({ dashboard }) {
  if (!hasLatestPedido(dashboard)) {
    return (
      <article className={styles.latestCard}>
        <span className={styles.latestEyebrow}>
          {SANTACASA_DASHBOARD_PAGE.labels.latestPedido}
        </span>

        <strong className={styles.latestTitle}>Sem pedidos registados</strong>

        <p className={styles.latestText}>
          Quando existir atividade, o último pedido enviado aparece aqui.
        </p>
      </article>
    );
  }

  return (
    <article className={styles.latestCard}>
      <div className={styles.latestHeader}>
        <div>
          <span className={styles.latestEyebrow}>
            {SANTACASA_DASHBOARD_PAGE.labels.latestPedido}
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
          <dt>{SANTACASA_DASHBOARD_PAGE.labels.createdAt}</dt>
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

export default function SantaCasaDashboardSignals({
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
          title={SANTACASA_DASHBOARD_PAGE.sections.signals.loadingTitle}
          description="Aguarda enquanto os sinais operacionais são carregados."
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <DashboardState
          title={SANTACASA_DASHBOARD_PAGE.sections.signals.errorTitle}
          description={error}
          actionLabel={SANTACASA_DASHBOARD_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  const mainMetrics = buildDashboardMainMetrics(dashboard);
  const receitasMetrics = buildReceitasMetrics(dashboard);
  const pedidosMetrics = buildPedidosMetrics(dashboard);
  const extrasMetrics = buildExtrasMetrics(dashboard);
  const regularizacoesMetrics = buildRegularizacoesMetrics(dashboard);

  return (
    <section
      className={styles.section}
      aria-labelledby="santacasa-dashboard-signals-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 id="santacasa-dashboard-signals-title" className={styles.title}>
            {SANTACASA_DASHBOARD_PAGE.sections.signals.title}
          </h2>

          <p className={styles.description}>
            {SANTACASA_DASHBOARD_PAGE.sections.signals.description}
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? SANTACASA_DASHBOARD_PAGE.actions.refreshing
            : SANTACASA_DASHBOARD_PAGE.actions.refresh}
        </button>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainMetrics}>
          {mainMetrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>

        <LatestPedido dashboard={dashboard} />
      </div>

      <div className={styles.groups}>
        <MetricsGroup
          title="Receitas e medicamentos"
          metrics={receitasMetrics}
        />
        <MetricsGroup title="Pedidos" metrics={pedidosMetrics} />
        <MetricsGroup title="Extras" metrics={extrasMetrics} />
        <MetricsGroup title="Regularizações" metrics={regularizacoesMetrics} />
      </div>
    </section>
  );
}
