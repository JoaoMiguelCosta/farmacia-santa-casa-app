import { FARMACIA_DASHBOARD_PAGE } from "../../config/farmaciaDashboardPage.config";

import {
  getLatestPedidoCreatedAtLabel,
  getLatestPedidoDecisionAtLabel,
  getLatestPedidoDecisionLabel,
  getLatestPedidoNumberLabel,
  getLatestPedidoStatusLabel,
  getLatestPedidoStatusTone,
  hasLatestPedido,
} from "../../utils/farmaciaDashboard.utils";

import styles from "./FarmaciaDashboardLatestPedido.module.css";

export default function FarmaciaDashboardLatestPedido({ dashboard }) {
  if (!hasLatestPedido(dashboard)) {
    return (
      <article className={styles.card}>
        <span className={styles.eyebrow}>
          {FARMACIA_DASHBOARD_PAGE.labels.latestPedido}
        </span>

        <strong className={styles.title}>
          {FARMACIA_DASHBOARD_PAGE.latestPedido.emptyTitle}
        </strong>

        <p className={styles.text}>
          {FARMACIA_DASHBOARD_PAGE.latestPedido.emptyDescription}
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
            {FARMACIA_DASHBOARD_PAGE.labels.latestPedido}
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
          <dt>{FARMACIA_DASHBOARD_PAGE.labels.createdAt}</dt>

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
