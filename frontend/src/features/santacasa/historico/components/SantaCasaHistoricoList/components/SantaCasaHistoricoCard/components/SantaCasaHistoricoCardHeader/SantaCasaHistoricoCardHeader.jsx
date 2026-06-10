// src/features/santacasa/historico/components/SantaCasaHistoricoList/components/SantaCasaHistoricoCard/components/SantaCasaHistoricoCardHeader/SantaCasaHistoricoCardHeader.jsx

import { SANTACASA_HISTORICO_PAGE } from "../../../../../../config/santaCasaHistoricoPage.config";

import styles from "../../SantaCasaHistoricoCard.module.css";

export default function SantaCasaHistoricoCardHeader({
  pedidoNumberLabel,
  statusLabel,
  closedAtLabel,
}) {
  return (
    <header className={styles.cardHeader}>
      <div className={styles.identity}>
        <span className={styles.eyebrow}>
          {SANTACASA_HISTORICO_PAGE.labels.pedido}
        </span>

        <h3>{pedidoNumberLabel}</h3>

        <p>
          {SANTACASA_HISTORICO_PAGE.labels.closedAt}: {closedAtLabel}
        </p>
      </div>

      <strong className={styles.status}>{statusLabel}</strong>
    </header>
  );
}
