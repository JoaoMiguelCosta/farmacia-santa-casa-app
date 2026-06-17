import { SANTACASA_DASHBOARD_PAGE } from "../../config/santaCasaDashboardPage.config";

import {
  getLatestPedidoCreatedAtLabel,
  getLatestPedidoDecisionAtLabel,
  getLatestPedidoDecisionLabel,
  getLatestPedidoNumberLabel,
  getLatestPedidoStatusLabel,
  getLatestPedidoStatusTone,
  hasLatestPedido,
} from "../../utils/santaCasaDashboard.utils";

import styles from "./SantaCasaDashboardLatestPedido.module.css";

export default function SantaCasaDashboardLatestPedido({ dashboard }) {
  if (!hasLatestPedido(dashboard)) {
    return (
      <article className={styles.card}>
        <span className={styles.eyebrow}>
          {SANTACASA_DASHBOARD_PAGE.labels.latestPedido}
        </span>

        <strong className={styles.title}>
          {SANTACASA_DASHBOARD_PAGE.latestPedido.emptyTitle}
        </strong>

        <p className={styles.text}>
          {SANTACASA_DASHBOARD_PAGE.latestPedido.emptyDescription}
        </p>
      </article>
    );
  }

  const statusTone = getLatestPedidoStatusTone(dashboard);

  const statusClassName = [styles.status, styles[statusTone]]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            {SANTACASA_DASHBOARD_PAGE.labels.latestPedido}
          </span>

          <strong className={styles.title}>
            {getLatestPedidoNumberLabel(dashboard)}
          </strong>
        </div>

        <span className={statusClassName}>
          {getLatestPedidoStatusLabel(dashboard)}
        </span>
      </div>

      <dl className={styles.meta}>
        <div>
          <dt>{SANTACASA_DASHBOARD_PAGE.labels.createdAt}</dt>

          <dd>{getLatestPedidoCreatedAtLabel(dashboard)}</dd>
        </div>

        <div>
          <dt>{getLatestPedidoDecisionLabel(dashboard)}</dt>

          <dd>{getLatestPedidoDecisionAtLabel(dashboard)}</dd>
        </div>
      </dl>
    </article>
  );
}
