import { Link } from "react-router-dom";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import styles from "./FarmaciaRegularizacoesHistoricoUtenteGroup.module.css";

const UNKNOWN_LABEL = "—";

function getUtenteName(group) {
  return group?.utente?.nome || UNKNOWN_LABEL;
}

function getUtenteNumber(group) {
  return group?.utente?.numero9 || UNKNOWN_LABEL;
}

function getPedidosLabel(pedidoNumbers = []) {
  if (pedidoNumbers.length === 0) return UNKNOWN_LABEL;

  return pedidoNumbers.map((numero) => `#${numero}`).join(", ");
}

function getDetailRoute(group) {
  return `/farmacia/regularizacoes/utente/${encodeURIComponent(
    group.id,
  )}/historico`;
}

export default function FarmaciaRegularizacoesHistoricoUtenteGroup({ group }) {
  if (!group) return null;

  return (
    <article
      className={styles.group}
      aria-label={
        FARMACIA_REGULARIZACOES_PAGE.accessibility
          .historicoUtenteRegularizacoesGroup
      }
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {FARMACIA_REGULARIZACOES_PAGE.labels.utente}
          </span>

          <h3 className={styles.title}>{getUtenteName(group)}</h3>

          <span className={styles.subtitle}>
            {FARMACIA_REGULARIZACOES_PAGE.labels.utenteNumber}:{" "}
            {getUtenteNumber(group)}
          </span>
        </div>

        <span className={styles.status}>
          {FARMACIA_REGULARIZACOES_PAGE.labels.regularizado}
        </span>
      </header>

      <dl className={styles.metrics}>
        <div className={styles.metric}>
          <dt>
            {FARMACIA_REGULARIZACOES_PAGE.labels.regularizacoesConcluidas}
          </dt>
          <dd>{group.totalRegularizacoes}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.unidadesRegularizadas}</dt>
          <dd>{group.totalUnidadesRegularizadas}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.receitasUsadas}</dt>
          <dd>{group.totalReceitasUsadas}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{group.totalPedidos}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.ultimaRegularizacao}</dt>
          <dd>{group.latestActivityLabel}</dd>
        </div>
      </dl>

      <div className={styles.pedidos}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(group.pedidoNumbers)}</strong>
      </div>

      <footer className={styles.footer}>
        <Link to={getDetailRoute(group)} className={styles.groupButton}>
          {FARMACIA_REGULARIZACOES_PAGE.actions.viewHistorico}
        </Link>
      </footer>
    </article>
  );
}
