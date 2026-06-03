// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/SantaCasaRegularizacoesState.jsx

import styles from "./SantaCasaRegularizacoesList.module.css";

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
        <button type="button" className={styles.stateAction} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
