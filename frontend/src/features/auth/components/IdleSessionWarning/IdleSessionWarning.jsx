import { AUTH_MESSAGES } from "../../config/auth.config";
import { useAuth } from "../../hooks/useAuth";

import styles from "./IdleSessionWarning.module.css";

function formatSeconds(milliseconds) {
  return Math.ceil(milliseconds / 1000);
}

export default function IdleSessionWarning() {
  const {
    isAuthenticated,
    isIdleWarningVisible,
    idleWarningBeforeMs,
    dismissIdleWarning,
  } = useAuth();

  if (!isAuthenticated || !isIdleWarningVisible) {
    return null;
  }

  return (
    <section
      className={styles.warning}
      role="status"
      aria-live="polite"
      aria-label="Aviso de sessão"
    >
      <div className={styles.inner}>
        <div className={styles.content}>
          <strong className={styles.title}>Sessão quase a terminar</strong>

          <p className={styles.description}>
            {AUTH_MESSAGES.sessionExpiringSoon} Tens cerca de{" "}
            <strong>{formatSeconds(idleWarningBeforeMs)} segundos</strong> para
            continuar.
          </p>
        </div>

        <button
          type="button"
          className={styles.action}
          onClick={dismissIdleWarning}
        >
          Continuar sessão
        </button>
      </div>
    </section>
  );
}
