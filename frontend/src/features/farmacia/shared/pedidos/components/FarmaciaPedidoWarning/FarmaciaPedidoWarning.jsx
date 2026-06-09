// src/features/farmacia/shared/pedidos/components/FarmaciaPedidoWarning/FarmaciaPedidoWarning.jsx
import styles from "./FarmaciaPedidoWarning.module.css";

export default function FarmaciaPedidoWarning({ warning, isCompact = false }) {
  if (!warning) return null;

  return (
    <aside
      className={styles.warning}
      data-compact={isCompact ? "true" : "false"}
      aria-label={warning.title}
    >
      <span className={styles.icon} aria-hidden="true">
        !
      </span>

      <div className={styles.content}>
        <strong className={styles.title}>{warning.title}</strong>

        <p className={styles.message}>{warning.message}</p>
      </div>
    </aside>
  );
}
