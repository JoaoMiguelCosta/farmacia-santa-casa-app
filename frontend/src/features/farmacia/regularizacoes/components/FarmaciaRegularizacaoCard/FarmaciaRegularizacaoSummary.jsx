import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import {
  getRegularizacaoCreatedAtLabel,
  getRegularizacaoEventosCount,
  getRegularizacaoPedidoLabel,
  getRegularizacaoPedidoNumbers,
  getRegularizacaoUpdatedAtLabel,
  getRegularizacaoUtenteLabel,
} from "../../utils/farmaciaRegularizacoes.utils";

import styles from "./FarmaciaRegularizacaoCard.module.css";

function getPedidoLabel(regularizacao) {
  const pedidoNumbers = getRegularizacaoPedidoNumbers(regularizacao);

  if (regularizacao?.isAggregated && pedidoNumbers.length > 1) {
    return FARMACIA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos;
  }

  return FARMACIA_REGULARIZACOES_PAGE.labels.pedidoNumber;
}

export default function FarmaciaRegularizacaoSummary({
  regularizacao,
  isHistory = false,
  showUtente = true,
}) {
  return (
    <dl className={styles.summary}>
      <div className={styles.summaryItem}>
        <dt>{getPedidoLabel(regularizacao)}</dt>
        <dd>{getRegularizacaoPedidoLabel(regularizacao)}</dd>
      </div>

      {showUtente ? (
        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.utente}</dt>
          <dd>{getRegularizacaoUtenteLabel(regularizacao)}</dd>
        </div>
      ) : null}

      <div className={styles.summaryItem}>
        <dt>
          {isHistory
            ? FARMACIA_REGULARIZACOES_PAGE.labels.updatedAt
            : FARMACIA_REGULARIZACOES_PAGE.labels.createdAt}
        </dt>
        <dd>
          {isHistory
            ? getRegularizacaoUpdatedAtLabel(regularizacao)
            : getRegularizacaoCreatedAtLabel(regularizacao)}
        </dd>
      </div>

      <div className={styles.summaryItem}>
        <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.eventos}</dt>
        <dd>{getRegularizacaoEventosCount(regularizacao)}</dd>
      </div>
    </dl>
  );
}
