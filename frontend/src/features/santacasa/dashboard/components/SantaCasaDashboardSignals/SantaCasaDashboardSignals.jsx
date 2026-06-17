import { SANTACASA_DASHBOARD_PAGE } from "../../config/santaCasaDashboardPage.config";

import {
  buildDashboardMetricGroups,
  buildDashboardPriorityMetrics,
} from "../../utils/santaCasaDashboard.utils";

import DashboardMetricGroup from "../../../../../shared/ui/DashboardMetricGroup/DashboardMetricGroup";
import DashboardPriorityCard from "../../../../../shared/ui/DashboardPriorityCard/DashboardPriorityCard";

import SantaCasaDashboardLatestPedido from "../SantaCasaDashboardLatestPedido/SantaCasaDashboardLatestPedido";
import SantaCasaDashboardState from "../SantaCasaDashboardState/SantaCasaDashboardState";

import Button from "../../../../../shared/ui/Button/Button";

import styles from "./SantaCasaDashboardSignals.module.css";

export default function SantaCasaDashboardSignals({
  dashboard = null,
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
}) {
  if (isLoading) {
    return (
      <section className={styles.stateSection} aria-live="polite">
        <SantaCasaDashboardState
          title={SANTACASA_DASHBOARD_PAGE.sections.signals.loadingTitle}
          description={
            SANTACASA_DASHBOARD_PAGE.sections.signals.loadingDescription
          }
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.stateSection} aria-live="polite">
        <SantaCasaDashboardState
          title={SANTACASA_DASHBOARD_PAGE.sections.signals.errorTitle}
          description={error}
          actionLabel={SANTACASA_DASHBOARD_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  const priorities = buildDashboardPriorityMetrics(dashboard);

  const metricGroups = buildDashboardMetricGroups(dashboard);

  const { priorities: prioritiesConfig, indicators } =
    SANTACASA_DASHBOARD_PAGE.sections;

  return (
    <div className={styles.dashboardContent}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarHeading}>
          <h2 className={styles.toolbarTitle}>{prioritiesConfig.title}</h2>

          <p className={styles.toolbarDescription}>
            {prioritiesConfig.description}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? SANTACASA_DASHBOARD_PAGE.actions.refreshing
            : SANTACASA_DASHBOARD_PAGE.actions.refresh}
        </Button>
      </header>

      <section
        className={styles.overview}
        aria-label={prioritiesConfig.ariaLabel}
      >
        <div className={styles.priorityGrid}>
          {priorities.map((priority) => (
            <DashboardPriorityCard key={priority.key} {...priority} />
          ))}
        </div>

        <SantaCasaDashboardLatestPedido dashboard={dashboard} />
      </section>

      <section
        className={styles.indicators}
        aria-labelledby="santacasa-dashboard-indicators-title"
      >
        <header className={styles.indicatorsHeader}>
          <p className={styles.indicatorsEyebrow}>{indicators.eyebrow}</p>

          <h2
            id="santacasa-dashboard-indicators-title"
            className={styles.indicatorsTitle}
          >
            {indicators.title}
          </h2>

          <p className={styles.indicatorsDescription}>
            {indicators.description}
          </p>
        </header>

        <div className={styles.groupGrid}>
          {metricGroups.map((group) => (
            <DashboardMetricGroup
              key={group.key}
              title={group.title}
              description={group.description}
              tone={group.tone}
              metrics={group.metrics}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
