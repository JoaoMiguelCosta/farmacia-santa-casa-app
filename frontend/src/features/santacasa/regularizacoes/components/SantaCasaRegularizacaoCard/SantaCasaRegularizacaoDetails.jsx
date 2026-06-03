// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoDetails.jsx

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import SantaCasaRegularizacaoEvent from "./SantaCasaRegularizacaoEvent";

import styles from "./SantaCasaRegularizacaoDetails.module.css";

export default function SantaCasaRegularizacaoDetails({
  eventos = [],
  onToggleDetails,
}) {
  return (
    <section className={styles.details}>
      <div className={styles.detailsHeader}>
        <h4 className={styles.detailsTitle}>
          {SANTACASA_REGULARIZACOES_PAGE.labels.eventos}
        </h4>

        <button
          type="button"
          className={styles.detailsButton}
          onClick={onToggleDetails}
        >
          {SANTACASA_REGULARIZACOES_PAGE.actions.hideDetails}
        </button>
      </div>

      <ul className={styles.eventsList}>
        {eventos.map((evento) => (
          <SantaCasaRegularizacaoEvent key={evento.id} evento={evento} />
        ))}
      </ul>
    </section>
  );
}
