// src/features/auth/components/IdleSessionWarning/IdleSessionWarning.jsx

import { useId } from "react";

import { useAuth } from "../../hooks/useAuth";

import { IDLE_SESSION_WARNING_CONFIG } from "./IdleSessionWarning.config";
import { formatIdleSessionDuration } from "./idleSessionWarning.utils";

import styles from "./IdleSessionWarning.module.css";

export default function IdleSessionWarning() {
  const titleId = useId();
  const descriptionId = useId();

  const {
    isAuthenticated,
    isIdleWarningVisible,
    idleWarningBeforeMs,
    dismissIdleWarning,
  } = useAuth();

  if (!isAuthenticated || !isIdleWarningVisible) {
    return null;
  }

  const formattedDuration = formatIdleSessionDuration(idleWarningBeforeMs);

  return (
    <section
      className={styles.warning}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className={styles.inner}>
        <span className={styles.indicator} aria-hidden="true">
          !
        </span>

        <div className={styles.content}>
          <strong id={titleId} className={styles.title}>
            {IDLE_SESSION_WARNING_CONFIG.title}
          </strong>

          <p id={descriptionId} className={styles.description}>
            {IDLE_SESSION_WARNING_CONFIG.description.message}{" "}
            {IDLE_SESSION_WARNING_CONFIG.description.remainingTimePrefix}{" "}
            <strong>{formattedDuration}</strong>{" "}
            {IDLE_SESSION_WARNING_CONFIG.description.remainingTimeSuffix}
          </p>
        </div>

        <button
          type="button"
          className={styles.action}
          onClick={dismissIdleWarning}
        >
          {IDLE_SESSION_WARNING_CONFIG.actions.continueSession}
        </button>
      </div>
    </section>
  );
}
