import Button from "../../../../../shared/ui/Button/Button";

import { SYSTEM_HEALTH_CONFIG } from "../../config/systemHealth.config";
import { useSystemHealth } from "../../hooks/useSystemHealth";

import SystemHealthCard from "../SystemHealthCard/SystemHealthCard";
import SystemHealthState from "../SystemHealthState/SystemHealthState";

import styles from "./SystemHealthPanel.module.css";

export default function SystemHealthPanel() {
  const { services, hasServices, isLoading, isRefreshing, refreshHealth } =
    useSystemHealth();

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <SystemHealthState
          title={SYSTEM_HEALTH_CONFIG.states.loadingTitle}
          description={SYSTEM_HEALTH_CONFIG.states.loadingDescription}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="system-health-panel-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>
            {SYSTEM_HEALTH_CONFIG.header.eyebrow}
          </p>

          <h2 id="system-health-panel-title" className={styles.title}>
            {SYSTEM_HEALTH_CONFIG.header.title}
          </h2>

          <p className={styles.description}>
            {SYSTEM_HEALTH_CONFIG.header.description}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={isRefreshing}
          onClick={refreshHealth}
        >
          {isRefreshing
            ? SYSTEM_HEALTH_CONFIG.actions.refreshing
            : SYSTEM_HEALTH_CONFIG.actions.refresh}
        </Button>
      </header>

      {!hasServices ? (
        <SystemHealthState
          title={SYSTEM_HEALTH_CONFIG.states.emptyTitle}
          description={SYSTEM_HEALTH_CONFIG.states.emptyDescription}
        />
      ) : (
        <div className={styles.grid}>
          {services.map((service) => (
            <SystemHealthCard key={service.key} service={service} />
          ))}
        </div>
      )}
    </section>
  );
}
