import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import styles from "./SantaCasaRegularizacoesHistoricoUtentePageContent.module.css";

const UNKNOWN_LABEL = "—";

function getUtenteNumber(summary) {
  return summary?.utente?.numero9 || UNKNOWN_LABEL;
}

function getPedidosLabel(pedidoNumbers = []) {
  if (pedidoNumbers.length === 0) return UNKNOWN_LABEL;

  return pedidoNumbers.map((numero) => `#${numero}`).join(", ");
}

export default function SantaCasaRegularizacoesHistoricoSummary({ summary }) {
  if (!summary) return null;

  return (
    <section
      className={styles.summary}
      aria-label={SANTACASA_REGULARIZACOES_PAGE.historyDetails.summaryAriaLabel}
    >
      <div className={styles.summaryFocus}>
        <span>
          {SANTACASA_REGULARIZACOES_PAGE.labels.regularizacoesConcluidas}
        </span>
        <strong>{summary.totalRegularizacoes}</strong>
      </div>

      <dl className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.utenteNumber}</dt>
          <dd>{getUtenteNumber(summary)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.unidadesRegularizadas}</dt>
          <dd>{summary.totalUnidadesRegularizadas}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.receitasUsadas}</dt>
          <dd>{summary.totalReceitasUsadas}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{summary.totalPedidos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.ultimaRegularizacao}</dt>
          <dd>{summary.latestActivityLabel}</dd>
        </div>
      </dl>

      <div className={styles.pedidos}>
        <span>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(summary.pedidoNumbers)}</strong>
      </div>
    </section>
  );
}
