import styles from "./SantaCasaHistoricoCardSummary.module.css";

import { getHistoricoPedidoSummaryItems } from "./santaCasaHistoricoCardSummary.utils";

function UtentesSummaryValue({ value }) {
  if (!value) return null;

  return (
    <div className={styles.utentesValue}>
      <strong className={styles.utentesCount}>{value.countLabel}</strong>

      <div className={styles.utentesList}>
        {value.visibleUtentes.map((utente) => (
          <span key={utente} className={styles.utenteLine}>
            {utente}
          </span>
        ))}

        {value.remainingUtentes > 0 ? (
          <span className={styles.remainingUtentes}>
            +{value.remainingUtentes} utentes
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SummaryValue({ item }) {
  if (item.type === "utentes") {
    return <UtentesSummaryValue value={item.value} />;
  }

  return <span className={styles.summaryValue}>{item.value}</span>;
}

function SummaryItem({ item }) {
  return (
    <div className={styles.summaryItem}>
      <dt>{item.label}</dt>

      <dd>
        <SummaryValue item={item} />
      </dd>
    </div>
  );
}

export default function SantaCasaHistoricoCardSummary({ pedido }) {
  const summaryItems = getHistoricoPedidoSummaryItems(pedido);

  return (
    <dl className={styles.summary}>
      {summaryItems.map((item) => (
        <SummaryItem key={item.key} item={item} />
      ))}
    </dl>
  );
}
