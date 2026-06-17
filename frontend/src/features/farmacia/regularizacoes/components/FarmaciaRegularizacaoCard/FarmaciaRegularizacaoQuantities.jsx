import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import {
  getRegularizacaoQuantidadeRegularizada,
  getRegularizacaoQuantidadeRestante,
  getRegularizacaoQuantidadeSolicitada,
} from "../../utils/farmaciaRegularizacoes.utils";

import styles from "./FarmaciaRegularizacaoCard.module.css";

function getQuantitiesClassName(isHistory) {
  return [styles.quantities, isHistory ? styles.quantitiesHistory : ""]
    .filter(Boolean)
    .join(" ");
}

export default function FarmaciaRegularizacaoQuantities({
  regularizacao,
  isHistory = false,
}) {
  return (
    <dl className={getQuantitiesClassName(isHistory)}>
      <div className={styles.quantityBlock}>
        <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeSolicitada}</dt>
        <dd>{getRegularizacaoQuantidadeSolicitada(regularizacao)}</dd>
      </div>

      <div className={styles.quantityBlock}>
        <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeRegularizada}</dt>
        <dd>{getRegularizacaoQuantidadeRegularizada(regularizacao)}</dd>
      </div>

      {!isHistory ? (
        <div className={styles.quantityBlock}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeRestante}</dt>
          <dd>{getRegularizacaoQuantidadeRestante(regularizacao)}</dd>
        </div>
      ) : null}
    </dl>
  );
}
