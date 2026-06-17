import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import {
  getEventoCreatedAtLabel,
  getEventoQuantidadeLabel,
  getEventoReceitaLinhaLabel,
  getEventoReceitaValidadeLabel,
} from "../../utils/farmaciaRegularizacoes.utils";

import FarmaciaRegularizacaoReceitaBarcodes from "./FarmaciaRegularizacaoReceitaBarcodes";

import styles from "./FarmaciaRegularizacaoCard.module.css";

function getEventoReceita(evento) {
  return evento?.receitaLinha?.receita ?? null;
}

export default function FarmaciaRegularizacaoEvent({ evento }) {
  const receita = getEventoReceita(evento);

  return (
    <li className={styles.event}>
      <div className={styles.eventMain}>
        <strong className={styles.eventTitle}>
          {getEventoReceitaLinhaLabel(evento)}
        </strong>

        <FarmaciaRegularizacaoReceitaBarcodes receita={receita} />

        <span className={styles.eventMeta}>
          {FARMACIA_REGULARIZACOES_PAGE.labels.validade}:{" "}
          {getEventoReceitaValidadeLabel(evento)}
        </span>

        <span className={styles.eventMeta}>
          {FARMACIA_REGULARIZACOES_PAGE.labels.createdAt}:{" "}
          {getEventoCreatedAtLabel(evento)}
        </span>
      </div>

      <div className={styles.eventSide}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.quantidade}</span>
        <strong>{getEventoQuantidadeLabel(evento)}</strong>
      </div>
    </li>
  );
}