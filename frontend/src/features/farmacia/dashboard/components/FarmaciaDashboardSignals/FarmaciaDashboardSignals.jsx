import { FARMACIA_DASHBOARD_PAGE } from "../../config/farmaciaDashboardPage.config";

import {
  buildDashboardMetricGroups,
  buildDashboardPriorityMetrics,
} from "../../utils/farmaciaDashboard.utils";

import FarmaciaDashboardLatestPedido from "../FarmaciaDashboardLatestPedido/FarmaciaDashboardLatestPedido";
import FarmaciaDashboardMetricGroup from "../FarmaciaDashboardMetricGroup/FarmaciaDashboardMetricGroup";
import FarmaciaDashboardPriorityCard from "../FarmaciaDashboardPriorityCard/FarmaciaDashboardPriorityCard";
import FarmaciaDashboardState from "../FarmaciaDashboardState/FarmaciaDashboardState";

import styles from "./FarmaciaDashboardSignals.module.css";

export default function FarmaciaDashboardSignals({
  dashboard = null,
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
}) {
  if (isLoading) {
    return (
      <section className={styles.stateSection} aria-live="polite">
        <FarmaciaDashboardState
          title={FARMACIA_DASHBOARD_PAGE.sections.signals.loadingTitle}
          description={
            FARMACIA_DASHBOARD_PAGE.sections.signals.loadingDescription
          }
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.stateSection} aria-live="polite">
        <FarmaciaDashboardState
          title={FARMACIA_DASHBOARD_PAGE.sections.signals.errorTitle}
          description={error}
          actionLabel={FARMACIA_DASHBOARD_PAGE.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  const priorities = buildDashboardPriorityMetrics(dashboard);

  const metricGroups = buildDashboardMetricGroups(dashboard);

  const { priorities: prioritiesConfig, indicators } =
    FARMACIA_DASHBOARD_PAGE.sections;

  return (
    <div className={styles.dashboardContent}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarHeading}>
          <h2 className={styles.toolbarTitle}>{prioritiesConfig.title}</h2>

          <p className={styles.toolbarDescription}>
            {prioritiesConfig.description}
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

      <section
        className={styles.overview}
        aria-label={prioritiesConfig.ariaLabel}
      >
        <div className={styles.priorityGrid}>
          {priorities.map((priority) => (
            <FarmaciaDashboardPriorityCard key={priority.key} {...priority} />
          ))}
        </div>

        <FarmaciaDashboardLatestPedido dashboard={dashboard} />
      </section>

      <section
        className={styles.indicators}
        aria-labelledby="farmacia-dashboard-indicators-title"
      >
        <header className={styles.indicatorsHeader}>
          <p className={styles.indicatorsEyebrow}>{indicators.eyebrow}</p>

          <h2
            id="farmacia-dashboard-indicators-title"
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
            <FarmaciaDashboardMetricGroup
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
