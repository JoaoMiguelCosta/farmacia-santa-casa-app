// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/SantaCasaRegularizacoesState.jsx

import Button from "../../../../../shared/ui/Button/Button";

import styles from "./SantaCasaRegularizacoesState.module.css";

export default function SantaCasaRegularizacoesState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.state}>
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
