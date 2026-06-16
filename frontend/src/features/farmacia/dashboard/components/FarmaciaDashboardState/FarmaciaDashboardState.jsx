import Button from "../../../../../shared/ui/Button/Button";
import styles from "./FarmaciaDashboardState.module.css";

export default function FarmaciaDashboardState({
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
