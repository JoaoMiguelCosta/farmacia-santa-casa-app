// src/shared/layouts/AppShell/components/AppSessionBar/AppSessionBar.jsx
import styles from "./AppSessionBar.module.css";

export default function AppSessionBar({
  ariaLabel,
  activeLabel,
  userName,
  meta,
  logoutLabel,
  isLoggingOut = false,
  onLogout,
}) {
  if (!userName) return null;

  return (
    <section className={styles.bar} aria-label={ariaLabel}>
      <div className={styles.identity}>
        <span className={styles.statusDot} aria-hidden="true" />

        <div className={styles.userText}>
          <span className={styles.label}>{activeLabel}</span>

          <strong className={styles.name}>{userName}</strong>

          {meta ? <span className={styles.meta}>{meta}</span> : null}
        </div>
      </div>

      <button
        type="button"
        className={styles.logoutButton}
        disabled={isLoggingOut}
        onClick={onLogout}
      >
        {logoutLabel}
      </button>
    </section>
  );
}
