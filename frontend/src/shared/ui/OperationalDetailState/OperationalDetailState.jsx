import Button from "../Button/Button";

import styles from "./OperationalDetailState.module.css";

export default function OperationalDetailState({
  title,
  description,
  actionLabel,
  isActionLoading = false,
  onAction,
}) {
  return (
    <div className={styles.state} role="status">
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          variant="secondary"
          size="sm"
          disabled={isActionLoading}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
