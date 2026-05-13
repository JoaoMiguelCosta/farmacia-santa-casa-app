import Button from "../Button/Button";

import styles from "./DataState.module.css";

export default function DataState({
  type = "empty",
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className={`${styles.state} ${styles[type]}`} role="status">
      <span className={styles.icon} aria-hidden="true">
        {type === "loading" ? "…" : type === "error" ? "!" : "∅"}
      </span>

      <div className={styles.content}>
        <h2>{title}</h2>

        {description ? <p>{description}</p> : null}

        {actionLabel && onAction ? (
          <Button
            variant={type === "error" ? "danger" : "secondary"}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
