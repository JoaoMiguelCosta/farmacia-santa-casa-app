// src/features/santacasa/historico/components/SantaCasaHistoricoCard/SantaCasaHistoricoCard.jsx

import { Link, useLocation } from "react-router-dom";

import { getSantaCasaHistoricoDetailRoute } from "../../../shared/config/santaCasaRoutes.config";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import { useSantaCasaHistoricoCard } from "./useSantaCasaHistoricoCard";

import styles from "./SantaCasaHistoricoCard.module.css";

export default function SantaCasaHistoricoCard({ pedido }) {
  const location = useLocation();

  const {
    cardClassName,

    pedidoNumberLabel,
    statusLabel,
    closedAtLabel,
    message,

    summaryItems,

    hasExpirationWarning,
    expirationWarningLabel,

    showReason,
    reasonTitle,
    reasonValue,
  } = useSantaCasaHistoricoCard(pedido);

  if (!pedido) {
    return null;
  }

  const detailRoute = getSantaCasaHistoricoDetailRoute(pedido.id);

  const returnRoute = [location.pathname, location.search].join("");

  return (
    <article className={cardClassName}>
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

      {message ? <p className={styles.message}>{message}</p> : null}

      <dl className={styles.summary}>
        {summaryItems.map((item) => (
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

      {hasExpirationWarning ? (
        <aside className={styles.warning} role="status">
          <div>
            <strong>
              {SANTACASA_HISTORICO_PAGE.labels.validatedWithWarningsNoticeTitle}
            </strong>

            <p>
              {SANTACASA_HISTORICO_PAGE.messages.validatedWithWarningsNotice}
            </p>
          </div>

          <span>{expirationWarningLabel}</span>
        </aside>
      ) : null}

      {showReason ? (
        <div className={styles.reason}>
          <strong>{reasonTitle}</strong>

          <p>{reasonValue}</p>
        </div>
      ) : null}

      <footer className={styles.actions}>
        <Link
          to={detailRoute}
          state={{
            from: returnRoute,
          }}
          className={styles.detailLink}
        >
          {SANTACASA_HISTORICO_PAGE.actions.viewPedido}
        </Link>
      </footer>
    </article>
  );
}
