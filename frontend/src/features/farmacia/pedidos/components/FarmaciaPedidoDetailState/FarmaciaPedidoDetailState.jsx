import Button from "../../../../../shared/ui/Button/Button";

import styles from "./FarmaciaPedidoDetailState.module.css";

export default function FarmaciaPedidoDetailState({
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
