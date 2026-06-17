import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";
import {
  getPedidosLabel,
  getUtenteNumber,
} from "../../utils/farmaciaRegularizacoesUtente.utils";

import styles from "./FarmaciaRegularizacoesUtenteSummary.module.css";

export default function FarmaciaRegularizacoesUtenteSummary({ group }) {
  if (!group) return null;

  return (
    <section
      className={styles.summary}
      aria-label={FARMACIA_REGULARIZACOES_PAGE.details.summaryAriaLabel}
    >
      <div className={styles.summaryFocus}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.unidadesRestantes}</span>
        <strong>{group.totalRestante}</strong>
      </div>

      <dl className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.utenteNumber}</dt>
          <dd>{getUtenteNumber(group)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.medicamentosPorRegularizar}</dt>
          <dd>{group.totalMedicamentos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{group.totalPedidos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.parciais}</dt>
          <dd>{group.totalParciais}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.pendentes}</dt>
          <dd>{group.totalPendentes}</dd>
        </div>
      </dl>

      <div className={styles.pedidos}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(group.pedidoNumbers)}</strong>
      </div>
    </section>
  );
}
