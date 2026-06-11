import { Link } from "react-router-dom";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import styles from "./FarmaciaRegularizacoesUtenteGroup.module.css";

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

function getGroupStatus(group) {
  if (Number(group?.totalParciais) > 0) {
    return {
      value: "partial",
      label: FARMACIA_REGULARIZACOES_PAGE.labels.comParciais,
    };
  }

  return {
    value: "pending",
    label: FARMACIA_REGULARIZACOES_PAGE.labels.comPendentes,
  };
}

function getDetailRoute(group) {
  return `/farmacia/regularizacoes/utente/${encodeURIComponent(group.id)}`;
}

export default function FarmaciaRegularizacoesUtenteGroup({ group }) {
  if (!group) return null;

  const status = getGroupStatus(group);

  return (
    <article
      className={styles.group}
      data-status={status.value}
      aria-label={
        FARMACIA_REGULARIZACOES_PAGE.accessibility.utenteRegularizacoesGroup
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

        <span className={styles.status} data-status={status.value}>
          {status.label}
        </span>
      </header>

      <dl className={styles.metrics}>
        <div className={styles.metric}>
          <dt>
            {FARMACIA_REGULARIZACOES_PAGE.labels.medicamentosPorRegularizar}
          </dt>
          <dd>{group.totalMedicamentos}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{group.totalPedidos}</dd>
        </div>

        <div className={styles.metric}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.unidadesRestantes}</dt>
          <dd>{group.totalRestante}</dd>
        </div>
      </dl>

      <div className={styles.statusSummary}>
        <span>
          {FARMACIA_REGULARIZACOES_PAGE.labels.parciais}:{" "}
          <strong>{group.totalParciais}</strong>
        </span>

        <span>
          {FARMACIA_REGULARIZACOES_PAGE.labels.pendentes}:{" "}
          <strong>{group.totalPendentes}</strong>
        </span>
      </div>

      <div className={styles.pedidos}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(group.pedidoNumbers)}</strong>
      </div>

      <footer className={styles.footer}>
        <Link to={getDetailRoute(group)} className={styles.groupButton}>
          {FARMACIA_REGULARIZACOES_PAGE.actions.viewRegularizacoes}
        </Link>
      </footer>
    </article>
  );
}
