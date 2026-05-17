import { useState } from "react";

import styles from "./FarmaciaRegularizacaoCard.module.css";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import {
  getEventoCreatedAtLabel,
  getEventoQuantidadeLabel,
  getEventoReceitaLinhaLabel,
  getEventoReceitaNumeroLabel,
  getEventoReceitaPinAcessoLabel,
  getEventoReceitaPinOpcaoLabel,
  getEventoReceitaValidadeLabel,
  getRegularizacaoCreatedAtLabel,
  getRegularizacaoEventos,
  getRegularizacaoEventosCount,
  getRegularizacaoMedicamentoLabel,
  getRegularizacaoPedidoLabel,
  getRegularizacaoProgressPercent,
  getRegularizacaoQuantidadeRegularizada,
  getRegularizacaoQuantidadeRestante,
  getRegularizacaoQuantidadeSolicitada,
  getRegularizacaoStatusLabel,
  getRegularizacaoUpdatedAtLabel,
  getRegularizacaoUtenteLabel,
  hasRegularizacaoEventos,
} from "../../utils/farmaciaRegularizacoes.utils";

function FarmaciaRegularizacaoEvento({ evento }) {
  return (
    <li className={styles.event}>
      <div className={styles.eventMain}>
        <strong className={styles.eventTitle}>
          {getEventoReceitaLinhaLabel(evento)}
        </strong>

        <span className={styles.eventMeta}>
          {FARMACIA_REGULARIZACOES_PAGE.labels.receitaNumber}:{" "}
          {getEventoReceitaNumeroLabel(evento)}
        </span>

        <span className={styles.eventMeta}>
          {FARMACIA_REGULARIZACOES_PAGE.labels.pinAcesso}:{" "}
          {getEventoReceitaPinAcessoLabel(evento)}
        </span>

        <span className={styles.eventMeta}>
          {FARMACIA_REGULARIZACOES_PAGE.labels.pinOpcao}:{" "}
          {getEventoReceitaPinOpcaoLabel(evento)}
        </span>

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

export default function FarmaciaRegularizacaoCard({
  regularizacao,
  variant = "pending",
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!regularizacao) return null;

  const isHistory = variant === "history";
  const progressPercent = getRegularizacaoProgressPercent(regularizacao);
  const eventos = getRegularizacaoEventos(regularizacao);
  const hasEventos = hasRegularizacaoEventos(regularizacao);

  function handleToggleDetails() {
    setIsDetailsOpen((currentValue) => !currentValue);
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>
            {FARMACIA_REGULARIZACOES_PAGE.labels.regularizacao}
          </span>

          <h3 className={styles.title}>
            {getRegularizacaoMedicamentoLabel(regularizacao)}
          </h3>
        </div>

        <span className={styles.status}>
          {getRegularizacaoStatusLabel(regularizacao.status)}
        </span>
      </header>

      <dl className={styles.summary}>
        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidoNumber}</dt>
          <dd>{getRegularizacaoPedidoLabel(regularizacao)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.utente}</dt>
          <dd>{getRegularizacaoUtenteLabel(regularizacao)}</dd>
        </div>

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

      {!hasEventos ? (
        <div className={styles.waitingRecipe}>
          <strong>{FARMACIA_REGULARIZACOES_PAGE.waitingRecipe.title}</strong>
          <span>{FARMACIA_REGULARIZACOES_PAGE.waitingRecipe.description}</span>
        </div>
      ) : null}

      <section className={styles.quantities} aria-label="Estado da quantidade">
        <div className={styles.quantityBlock}>
          <span>
            {FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeSolicitada}
          </span>
          <strong>{getRegularizacaoQuantidadeSolicitada(regularizacao)}</strong>
        </div>

        <div className={styles.quantityBlock}>
          <span>
            {FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeRegularizada}
          </span>
          <strong>
            {getRegularizacaoQuantidadeRegularizada(regularizacao)}
          </strong>
        </div>

        <div className={styles.quantityBlock}>
          <span>{FARMACIA_REGULARIZACOES_PAGE.labels.quantidadeRestante}</span>
          <strong>{getRegularizacaoQuantidadeRestante(regularizacao)}</strong>
        </div>
      </section>

      <div className={styles.progressWrap}>
        <div className={styles.progressHeader}>
          <span>Progresso</span>
          <strong>{progressPercent}%</strong>
        </div>

        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <span
            className={styles.progressBar}
            style={{ "--progress-value": `${progressPercent}%` }}
          />
        </div>
      </div>

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.detailsButton}
          disabled={!hasEventos}
          onClick={handleToggleDetails}
        >
          {isDetailsOpen
            ? FARMACIA_REGULARIZACOES_PAGE.actions.hideDetails
            : FARMACIA_REGULARIZACOES_PAGE.actions.viewDetails}
        </button>
      </footer>

      {isDetailsOpen && hasEventos ? (
        <section className={styles.details}>
          <h4 className={styles.detailsTitle}>
            {FARMACIA_REGULARIZACOES_PAGE.labels.eventos}
          </h4>

          <ul className={styles.eventsList}>
            {eventos.map((evento) => (
              <FarmaciaRegularizacaoEvento key={evento.id} evento={evento} />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
