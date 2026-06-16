import { SYSTEM_HEALTH_CONFIG } from "../../config/systemHealth.config";

import {
  formatPayload,
  getCheckedAtLabel,
  getStatusLabel,
} from "../../utils/systemHealth.utils";

import styles from "./SystemHealthCard.module.css";

export default function SystemHealthCard({ service }) {
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
