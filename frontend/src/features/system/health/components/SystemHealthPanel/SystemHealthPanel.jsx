// src/features/system/health/components/SystemHealthPanel/SystemHealthPanel.jsx

import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { SYSTEM_HEALTH_CONFIG } from "../../config/systemHealth.config";
import { useSystemHealth } from "../../hooks/useSystemHealth";

import styles from "./SystemHealthPanel.module.css";

function formatPayload(payload) {
  if (!payload) return SYSTEM_HEALTH_CONFIG.labels.unavailable;

  return JSON.stringify(payload, null, 2);
}

function getStatusLabel(status) {
  return SYSTEM_HEALTH_CONFIG.status[status] || status;
}

function getCheckedAtLabel(value) {
  if (!value) return SYSTEM_HEALTH_CONFIG.labels.unavailable;

  return formatDateTime(value);
}

function SystemHealthState({ title, description }) {
  return (
    <div className={styles.state}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}
    </div>
  );
}

function SystemHealthCard({ service }) {
  const isOnline = service.status === "online";
  const payload = isOnline
    ? service.data
    : {
        error: service.error,
        checkedAt: service.checkedAt,
      };

  const cardClassName = [
    styles.card,
    isOnline ? styles.onlineCard : styles.offlineCard,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClassName}>
      <div className={styles.cardHeader}>
        <span
          className={
            isOnline ? styles.statusBadgeOnline : styles.statusBadgeOffline
          }
        >
          <span
            className={
              isOnline ? styles.statusDotOnline : styles.statusDotOffline
            }
            aria-hidden="true"
          />

          {getStatusLabel(service.status)}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{service.title}</h3>

        <p className={styles.cardDescription}>{service.description}</p>
      </div>

      <dl className={styles.metaList}>
        <div className={styles.metaItem}>
          <dt>{SYSTEM_HEALTH_CONFIG.labels.checkedAt}</dt>
          <dd>{getCheckedAtLabel(service.checkedAt)}</dd>
        </div>

        {!isOnline ? (
          <div className={styles.metaItem}>
            <dt>{SYSTEM_HEALTH_CONFIG.labels.error}</dt>
            <dd>{service.error || SYSTEM_HEALTH_CONFIG.labels.unavailable}</dd>
          </div>
        ) : null}
      </dl>

      <details className={styles.payloadDetails}>
        <summary>{SYSTEM_HEALTH_CONFIG.labels.technicalDetails}</summary>

        <pre className={styles.payload}>
          <code>{formatPayload(payload)}</code>
        </pre>
      </details>
    </article>
  );
}

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

        <button
          type="button"
          className={styles.refreshButton}
          disabled={isRefreshing}
          onClick={refreshHealth}
        >
          {isRefreshing
            ? SYSTEM_HEALTH_CONFIG.actions.refreshing
            : SYSTEM_HEALTH_CONFIG.actions.refresh}
        </button>
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
