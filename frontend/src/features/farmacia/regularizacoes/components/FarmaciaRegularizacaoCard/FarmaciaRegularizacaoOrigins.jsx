import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import {
  getRegularizacaoCreatedAtLabel,
  getRegularizacaoPedidoLabel,
  getRegularizacaoQuantidadeRegularizada,
  getRegularizacaoQuantidadeRestante,
  getRegularizacaoQuantidadeSolicitada,
  getRegularizacaoStatusLabel,
} from "../../utils/farmaciaRegularizacoes.utils";

import styles from "./FarmaciaRegularizacaoCard.module.css";

export default function FarmaciaRegularizacaoOrigins({ origins = [] }) {
  return (
    <section className={styles.origins}>
      <h4 className={styles.detailsTitle}>
        {FARMACIA_REGULARIZACOES_PAGE.labels.origemPorPedido}
      </h4>

      <ul className={styles.originList}>
        {origins.map((origin) => (
          <li key={origin.id} className={styles.originItem}>
            <div className={styles.originHeader}>
              <strong>{getRegularizacaoPedidoLabel(origin)}</strong>

              <span>{getRegularizacaoStatusLabel(origin.status)}</span>
            </div>

            <dl className={styles.originMetrics}>
              <div>
                <dt>
                  {FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeSolicitada}
                </dt>
                <dd>{getRegularizacaoQuantidadeSolicitada(origin)}</dd>
              </div>

              <div>
                <dt>
                  {FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeRegularizada}
                </dt>
                <dd>{getRegularizacaoQuantidadeRegularizada(origin)}</dd>
              </div>

              <div>
                <dt>
                  {FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeRestante}
                </dt>
                <dd>{getRegularizacaoQuantidadeRestante(origin)}</dd>
              </div>

              <div>
                <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.createdAt}</dt>
                <dd>{getRegularizacaoCreatedAtLabel(origin)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
