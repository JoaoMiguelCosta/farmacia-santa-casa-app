import Button from "../../../../../shared/ui/Button/Button";
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
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  );
}
