import SantaCasaHistoricoCardDetails from "./SantaCasaHistoricoCardDetails/SantaCasaHistoricoCardDetails";
import SantaCasaHistoricoCardHeader from "./SantaCasaHistoricoCardHeader/SantaCasaHistoricoCardHeader";
import SantaCasaHistoricoCardNotice from "./SantaCasaHistoricoCardNotice/SantaCasaHistoricoCardNotice";
import SantaCasaHistoricoCardStats from "./SantaCasaHistoricoCardStats/SantaCasaHistoricoCardStats";
import SantaCasaHistoricoCardSummary from "./SantaCasaHistoricoCardSummary/SantaCasaHistoricoCardSummary";

import styles from "./SantaCasaHistoricoCard.module.css";

import { useSantaCasaHistoricoCard } from "./useSantaCasaHistoricoCard";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

export default function SantaCasaHistoricoCard({ pedido }) {
  const { items, isDetailsOpen, cardClassName, handleToggleDetails } =
    useSantaCasaHistoricoCard(pedido);

  if (!pedido) return null;

  return (
    <article className={cardClassName}>
      <SantaCasaHistoricoCardHeader pedido={pedido} />

      <SantaCasaHistoricoCardNotice pedido={pedido} />

      <SantaCasaHistoricoCardStats pedido={pedido} />

      <SantaCasaHistoricoCardSummary pedido={pedido} />

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.detailsButton}
          onClick={handleToggleDetails}
        >
          {isDetailsOpen
            ? SANTACASA_HISTORICO_PAGE.actions.hideDetails
            : SANTACASA_HISTORICO_PAGE.actions.viewDetails}
        </button>
      </footer>

      {isDetailsOpen ? <SantaCasaHistoricoCardDetails items={items} /> : null}
    </article>
  );
}
