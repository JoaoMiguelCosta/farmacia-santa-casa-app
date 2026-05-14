import Button from "../Button/Button";

import styles from "./DataState.module.css";

const VALID_TYPES = ["empty", "loading", "error"];

function getSafeType(type) {
  return VALID_TYPES.includes(type) ? type : "empty";
}

export default function DataState({
  type = "empty",
  title,
  description,
  actionLabel,
  onAction,
}) {
  const stateType = getSafeType(type);
  const isError = stateType === "error";
  const isLoading = stateType === "loading";

  return (
    <div
      className={`${styles.state} ${styles[stateType]}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-busy={isLoading || undefined}
    >
      <span className={styles.icon} aria-hidden="true">
        {isLoading ? "…" : isError ? "!" : "∅"}
      </span>

      <div className={styles.content}>
        <h2>{title}</h2>

        {description ? <p>{description}</p> : null}

        {actionLabel && onAction ? (
          <div className={styles.action}>
            <Button
              variant={isError ? "danger" : "secondary"}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
