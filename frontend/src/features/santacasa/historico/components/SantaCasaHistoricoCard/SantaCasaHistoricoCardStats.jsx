import styles from "./SantaCasaHistoricoCardStats.module.css";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import { getHistoricoPedidoCardStats } from "./santaCasaHistoricoCardStats.utils";

function getStatsClassName(variant) {
  return [
    styles.stats,
    variant === "success" ? styles.statsSuccess : "",
    variant === "warning" ? styles.statsWarning : "",
    variant === "danger" ? styles.statsDanger : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function getStatClassName(variant) {
  return [
    styles.stat,
    variant === "success" ? styles.statSuccess : "",
    variant === "warning" ? styles.statWarning : "",
    variant === "danger" ? styles.statDanger : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function SantaCasaHistoricoCardStats({ pedido }) {
  const { variant, stats } = getHistoricoPedidoCardStats(pedido);

  if (stats.length === 0) return null;

  return (
    <section
      className={getStatsClassName(variant)}
      aria-label={SANTACASA_HISTORICO_PAGE.labels.cardStatsAriaLabel}
    >
      <span className={styles.title}>
        {SANTACASA_HISTORICO_PAGE.labels.cardStatsTitle}
      </span>

      <div className={styles.statsList}>
        {stats.map((stat) => (
          <div key={stat.key} className={getStatClassName(stat.variant)}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
