import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";
import {
  getPedidosLabel,
  getUtenteNumber,
} from "../../utils/santaCasaRegularizacoesUtente.utils";

import styles from "./SantaCasaRegularizacoesUtenteSummary.module.css";

export default function SantaCasaRegularizacoesUtenteSummary({ group }) {
  if (!group) return null;

  return (
    <section
      className={styles.summary}
      aria-label={SANTACASA_REGULARIZACOES_PAGE.details.summaryAriaLabel}
    >
      <div className={styles.summaryFocus}>
        <span>{SANTACASA_REGULARIZACOES_PAGE.labels.unidadesRestantes}</span>
        <strong>{group.totalRestante}</strong>
      </div>

      <dl className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.utenteNumber}</dt>
          <dd>{getUtenteNumber(group)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.medicamentosPorRegularizar}</dt>
          <dd>{group.totalMedicamentos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{group.totalPedidos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.parciais}</dt>
          <dd>{group.totalParciais}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.pendentes}</dt>
          <dd>{group.totalPendentes}</dd>
        </div>
      </dl>

      <div className={styles.pedidos}>
        <span>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(group.pedidoNumbers)}</strong>
      </div>
    </section>
  );
}
