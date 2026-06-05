import SantaCasaHistoricoCardDetails from "./SantaCasaHistoricoCardDetails";
import SantaCasaHistoricoCardHeader from "./SantaCasaHistoricoCardHeader";
import SantaCasaHistoricoCardNotice from "./SantaCasaHistoricoCardNotice";
import SantaCasaHistoricoCardStats from "./SantaCasaHistoricoCardStats";
import SantaCasaHistoricoCardSummary from "./SantaCasaHistoricoCardSummary";

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
