import styles from "./SantaCasaDashboardState.module.css";

export default function SantaCasaDashboardState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.state}>
      <strong className={styles.title}>{title}</strong>

      {description ? <p className={styles.description}>{description}</p> : null}

      {actionLabel && onAction ? (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
