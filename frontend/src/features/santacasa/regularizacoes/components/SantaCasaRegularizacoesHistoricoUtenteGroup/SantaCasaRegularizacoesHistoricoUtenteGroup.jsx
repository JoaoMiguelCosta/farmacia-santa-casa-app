import { Link } from "react-router-dom";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import styles from "./SantaCasaRegularizacoesHistoricoUtenteGroup.module.css";

const UNKNOWN_LABEL = "—";

function getUtenteName(group) {
  return group?.utenteNome || group?.utente?.nome || UNKNOWN_LABEL;
}

function getUtenteNumber(group) {
  return group?.utenteNumero || group?.utente?.numero9 || UNKNOWN_LABEL;
}

function getPedidosLabel(pedidoNumbers = []) {
  if (pedidoNumbers.length === 0) return UNKNOWN_LABEL;

  return pedidoNumbers.map((numero) => `#${numero}`).join(", ");
}

function getDetailRoute(group) {
  return `/santacasa/regularizacoes/utente/${encodeURIComponent(
    group.id,
  )}/historico`;
}

export default function SantaCasaRegularizacoesHistoricoUtenteGroup({ group }) {
  if (!group) return null;

  return (
    <article
      className={styles.group}
      aria-label={`${SANTACASA_REGULARIZACOES_PAGE.labels.utente}: ${getUtenteName(
        group,
      )}`}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.utente}
          </span>

          <h3 className={styles.title}>{getUtenteName(group)}</h3>

          <span className={styles.subtitle}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.utenteNumber}:{" "}
            {getUtenteNumber(group)}
          </span>
        </div>

        <span className={styles.status}>
          {SANTACASA_REGULARIZACOES_PAGE.labels.regularizado}
        </span>
      </header>

      <dl className={styles.metrics}>
        <div className={styles.metric}>
          <dt>
            {SANTACASA_REGULARIZACOES_PAGE.labels.regularizacoesConcluidas}
          </dt>
          <dd>{group.totalRegularizacoes}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.unidadesRegularizadas}</dt>
          <dd>{group.totalUnidadesRegularizadas}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.receitasUsadas}</dt>
          <dd>{group.totalReceitasUsadas}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{group.totalPedidos}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.ultimaRegularizacao}</dt>
          <dd>{group.latestActivityLabel}</dd>
        </div>
      </dl>

      <div className={styles.pedidos}>
        <span>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(group.pedidoNumbers)}</strong>
      </div>

      <footer className={styles.footer}>
        <Link to={getDetailRoute(group)} className={styles.groupButton}>
          {SANTACASA_REGULARIZACOES_PAGE.actions.consultHistorico}
        </Link>
      </footer>
    </article>
  );
}
