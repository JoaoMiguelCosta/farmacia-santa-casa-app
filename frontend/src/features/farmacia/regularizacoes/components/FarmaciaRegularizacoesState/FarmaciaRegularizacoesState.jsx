import styles from "./FarmaciaRegularizacoesState.module.css";

export default function FarmaciaRegularizacoesState({
  title,
  description,
  actionLabel,
  variant = "standalone",
  onAction,
}) {
  const stateClassName =
    variant === "embedded"
      ? `${styles.state} ${styles.stateEmbedded}`
      : styles.state;

  return (
    <div className={stateClassName}>
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
