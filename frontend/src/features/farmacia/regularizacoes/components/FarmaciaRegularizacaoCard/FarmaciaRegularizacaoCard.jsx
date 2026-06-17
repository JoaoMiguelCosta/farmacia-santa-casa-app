import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import FarmaciaRegularizacaoDetails from "./FarmaciaRegularizacaoDetails";
import FarmaciaRegularizacaoProgress from "./FarmaciaRegularizacaoProgress";
import FarmaciaRegularizacaoQuantities from "./FarmaciaRegularizacaoQuantities";
import FarmaciaRegularizacaoSummary from "./FarmaciaRegularizacaoSummary";
import { useFarmaciaRegularizacaoCard } from "./useFarmaciaRegularizacaoCard";

import styles from "./FarmaciaRegularizacaoCard.module.css";

export default function FarmaciaRegularizacaoCard({
  regularizacao,
  variant = "pending",
  showUtente = true,
}) {
  const {
    isHistory,
    isDetailsOpen,
    progressPercent,
    eventos,
    origins,
    hasEventos,
    hasDetails,
    medicamentoLabel,
    statusLabel,
    toggleDetails,
  } = useFarmaciaRegularizacaoCard({
    regularizacao,
    variant,
  });

  if (!regularizacao) return null;

  const status = regularizacao.status || "";

  return (
    <article className={styles.card} data-status={status}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {FARMACIA_REGULARIZACOES_PAGE.labels.regularizacao}
          </span>

          <h3 className={styles.title}>{medicamentoLabel}</h3>
        </div>

        <span className={styles.status} data-status={status}>
          {statusLabel}
        </span>
      </header>

      <FarmaciaRegularizacaoSummary
        regularizacao={regularizacao}
        isHistory={isHistory}
        showUtente={showUtente}
      />

      {!isHistory && !hasEventos ? (
        <div className={styles.waitingRecipe}>
          <strong>{FARMACIA_REGULARIZACOES_PAGE.waitingRecipe.title}</strong>
          <span>{FARMACIA_REGULARIZACOES_PAGE.waitingRecipe.description}</span>
        </div>
      ) : null}

      <FarmaciaRegularizacaoQuantities
        regularizacao={regularizacao}
        isHistory={isHistory}
      />

      <FarmaciaRegularizacaoProgress progressPercent={progressPercent} />

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.detailsButton}
          disabled={!hasDetails}
          onClick={toggleDetails}
        >
          {isDetailsOpen
            ? FARMACIA_REGULARIZACOES_PAGE.actions.hideDetails
            : FARMACIA_REGULARIZACOES_PAGE.actions.viewDetails}
        </button>
      </footer>

      {isDetailsOpen && hasDetails ? (
        <FarmaciaRegularizacaoDetails eventos={eventos} origins={origins} />
      ) : null}
    </article>
  );
}
