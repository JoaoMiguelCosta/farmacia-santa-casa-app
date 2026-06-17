// src/features/santacasa/historico/components/SantaCasaHistoricoList/components/SantaCasaHistoricoCard/components/SantaCasaHistoricoCardStats/SantaCasaHistoricoCardStats.jsx

import styles from "../../SantaCasaHistoricoCard.module.css";

export default function SantaCasaHistoricoCardStats({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <dl className={styles.summary}>
      {items.map((item) => (
        <div
          key={item.key}
          className={styles.summaryItem}
          data-tone={item.tone}
        >
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
