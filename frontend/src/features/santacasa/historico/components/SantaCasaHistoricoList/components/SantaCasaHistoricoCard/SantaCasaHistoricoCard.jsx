import { Link, useLocation } from "react-router-dom";

import { getSantaCasaHistoricoDetailRoute } from "../../../../../shared/config/santaCasaRoutes.config";

import { SANTACASA_HISTORICO_PAGE } from "../../../../config/santaCasaHistoricoPage.config";

import SantaCasaHistoricoCardHeader from "./components/SantaCasaHistoricoCardHeader/SantaCasaHistoricoCardHeader";
import SantaCasaHistoricoCardNotice from "./components/SantaCasaHistoricoCardNotice/SantaCasaHistoricoCardNotice";
import SantaCasaHistoricoCardStats from "./components/SantaCasaHistoricoCardStats/SantaCasaHistoricoCardStats";

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
      <SantaCasaHistoricoCardHeader
        pedidoNumberLabel={pedidoNumberLabel}
        statusLabel={statusLabel}
        closedAtLabel={closedAtLabel}
      />

      <SantaCasaHistoricoCardNotice
        message={message}
        hasExpirationWarning={hasExpirationWarning}
        expirationWarningLabel={expirationWarningLabel}
        showReason={showReason}
        reasonTitle={reasonTitle}
        reasonValue={reasonValue}
      />

      <SantaCasaHistoricoCardStats items={summaryItems} />

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
