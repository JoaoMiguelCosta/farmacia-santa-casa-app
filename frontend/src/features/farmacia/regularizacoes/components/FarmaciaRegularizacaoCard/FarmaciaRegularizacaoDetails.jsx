import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import FarmaciaRegularizacaoEvent from "./FarmaciaRegularizacaoEvent";
import FarmaciaRegularizacaoOrigins from "./FarmaciaRegularizacaoOrigins";

import styles from "./FarmaciaRegularizacaoCard.module.css";

export default function FarmaciaRegularizacaoDetails({
  eventos = [],
  origins = [],
}) {
  const hasOrigins = origins.length > 0;
  const hasEventos = eventos.length > 0;

  return (
    <section className={styles.details}>
      {hasOrigins ? <FarmaciaRegularizacaoOrigins origins={origins} /> : null}

      {hasEventos ? (
        <>
          <h4 className={styles.detailsTitle}>
            {FARMACIA_REGULARIZACOES_PAGE.labels.eventos}
          </h4>

          <ul className={styles.eventsList}>
            {eventos.map((evento) => (
              <FarmaciaRegularizacaoEvent key={evento.id} evento={evento} />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
