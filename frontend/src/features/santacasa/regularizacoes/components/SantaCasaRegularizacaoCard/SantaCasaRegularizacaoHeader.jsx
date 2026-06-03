// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/SantaCasaRegularizacaoHeader.jsx

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  getRegularizacaoMedicamentoLabel,
  getRegularizacaoPedidoLabel,
  getRegularizacaoStatusLabel,
  getRegularizacaoUtenteNomeLabel,
  getRegularizacaoUtenteNumeroLabel,
} from "../../utils/santaCasaRegularizacoes.utils";

import { getStatusClassName } from "./santaCasaRegularizacaoCard.utils";

import styles from "./SantaCasaRegularizacaoHeader.module.css";

function getHeaderClassName(isHistory) {
  return isHistory ? `${styles.header} ${styles.headerHistory}` : styles.header;
}

function getIdentityGridClassName({ isGrouped, isHistory }) {
  return [
    styles.identityGrid,
    isGrouped ? styles.identityGridGrouped : "",
    isHistory ? styles.identityGridHistory : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function SantaCasaRegularizacaoHeader({
  regularizacao,
  isCompleted,
  isGrouped,
  isHistory,
  dateLabel,
  dateValue,
}) {
  const statusClassName = getStatusClassName({ styles, isCompleted });

  const identityGridClassName = getIdentityGridClassName({
    isGrouped,
    isHistory,
  });

  return (
    <header className={getHeaderClassName(isHistory)}>
      <div className={styles.statusGroup}>
        <span className={statusClassName}>
          {getRegularizacaoStatusLabel(regularizacao.status)}
        </span>

        <div className={styles.headerMeta}>
          <span className={styles.pedidoPill}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.pedidoNumber}{" "}
            {getRegularizacaoPedidoLabel(regularizacao)}
          </span>

          <span className={styles.datePill}>
            {dateLabel} {dateValue}
          </span>
        </div>
      </div>

      <dl className={identityGridClassName}>
        <div>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.medicamento}</dt>
          <dd>{getRegularizacaoMedicamentoLabel(regularizacao)}</dd>
        </div>

        {!isGrouped ? (
          <>
            <div>
              <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.utente}</dt>
              <dd>{getRegularizacaoUtenteNomeLabel(regularizacao)}</dd>
            </div>

            <div>
              <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.utenteNumber}</dt>
              <dd>{getRegularizacaoUtenteNumeroLabel(regularizacao)}</dd>
            </div>
          </>
        ) : null}
      </dl>
    </header>
  );
}
