import { classNames } from "../../../../../shared/utils/classNames";

import Button from "../../../../../shared/ui/Button/Button";

import styles from "./FarmaciaRegularizacoesState.module.css";

export default function FarmaciaRegularizacoesState({
  title,
  description,
  actionLabel,
  variant = "standalone",
  onAction,
}) {
  const stateClassName = classNames(styles.state, variant === "embedded" && styles.stateEmbedded);

  return (
    <div className={stateClassName}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
