import { useState } from "react";

import BarcodeValue from "../../../../../shared/ui/BarcodeValue/BarcodeValue";

import styles from "./SantaCasaRegularizacaoCard.module.css";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  getEventoCreatedAtLabel,
  getEventoQuantidadeLabel,
  getEventoReceitaLinhaLabel,
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
  getRegularizacaoSituationDescription,
  getRegularizacaoSituationTitle,
  getRegularizacaoStatusLabel,
  getRegularizacaoUpdatedAtLabel,
  getRegularizacaoUtenteLabel,
  hasRegularizacaoEventos,
} from "../../utils/santaCasaRegularizacoes.utils";

function getEventoReceita(evento) {
  return evento?.receitaLinha?.receita ?? null;
}

function SantaCasaRegularizacaoReceitaBarcodes({ receita }) {
  if (!receita) return null;

  const codes = [
    {
      key: "numero19",
      label: "N.º receita",
      value: receita.numero19,
      width: 0.72,
    },
    {
      key: "pinAcesso6",
      label: "PIN acesso",
      value: receita.pinAcesso6,
      width: 1.08,
    },
    {
      key: "pinOpcao4",
      label: "PIN opção",
      value: receita.pinOpcao4,
      width: 1.16,
    },
  ];

  return (
    <div className={styles.barcodePanel} aria-label="Códigos da receita">
      {codes.map((code) => (
        <BarcodeValue
          key={code.key}
          size="compact"
          label={code.label}
          value={code.value}
          caption={code.value}
          height={28}
          width={code.width}
          displayValue={false}
        />
      ))}
    </div>
  );
}

function SantaCasaRegularizacaoEvento({ evento }) {
  const receita = getEventoReceita(evento);

  return (
    <li className={styles.event}>
      <div className={styles.eventMain}>
        <strong className={styles.eventTitle}>
          {getEventoReceitaLinhaLabel(evento)}
        </strong>

        <SantaCasaRegularizacaoReceitaBarcodes receita={receita} />

        <span className={styles.eventMeta}>
          {SANTACASA_REGULARIZACOES_PAGE.labels.validade}:{" "}
          {getEventoReceitaValidadeLabel(evento)}
        </span>

        <span className={styles.eventMeta}>
          {SANTACASA_REGULARIZACOES_PAGE.labels.createdAt}:{" "}
          {getEventoCreatedAtLabel(evento)}
        </span>
      </div>

      <div className={styles.eventSide}>
        <span>{SANTACASA_REGULARIZACOES_PAGE.labels.quantidade}</span>
        <strong>{getEventoQuantidadeLabel(evento)}</strong>
      </div>
    </li>
  );
}

export default function SantaCasaRegularizacaoCard({
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
            {SANTACASA_REGULARIZACOES_PAGE.labels.regularizacao}
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
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.utente}</dt>
          <dd>{getRegularizacaoUtenteLabel(regularizacao)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidoNumber}</dt>
          <dd>{getRegularizacaoPedidoLabel(regularizacao)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>
            {isHistory
              ? SANTACASA_REGULARIZACOES_PAGE.labels.updatedAt
              : SANTACASA_REGULARIZACOES_PAGE.labels.createdAt}
          </dt>
          <dd>
            {isHistory
              ? getRegularizacaoUpdatedAtLabel(regularizacao)
              : getRegularizacaoCreatedAtLabel(regularizacao)}
          </dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.eventos}</dt>
          <dd>{getRegularizacaoEventosCount(regularizacao)}</dd>
        </div>
      </dl>

      <section
        className={styles.quantities}
        aria-label="Estado da regularização"
      >
        <div className={styles.quantityBlock}>
          <span>
            {SANTACASA_REGULARIZACOES_PAGE.labels.quantidadeSolicitada}
          </span>
          <strong>{getRegularizacaoQuantidadeSolicitada(regularizacao)}</strong>
        </div>

        <div className={styles.quantityBlock}>
          <span>
            {SANTACASA_REGULARIZACOES_PAGE.labels.quantidadeRegularizada}
          </span>
          <strong>
            {getRegularizacaoQuantidadeRegularizada(regularizacao)}
          </strong>
        </div>

        <div className={styles.quantityBlock}>
          <span>{SANTACASA_REGULARIZACOES_PAGE.labels.quantidadeRestante}</span>
          <strong>{getRegularizacaoQuantidadeRestante(regularizacao)}</strong>
        </div>
      </section>

      <div className={styles.situation}>
        <strong>{getRegularizacaoSituationTitle(regularizacao)}</strong>
        <span>{getRegularizacaoSituationDescription(regularizacao)}</span>
      </div>

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
            ? SANTACASA_REGULARIZACOES_PAGE.actions.hideDetails
            : SANTACASA_REGULARIZACOES_PAGE.actions.viewDetails}
        </button>
      </footer>

      {isDetailsOpen && hasEventos ? (
        <section className={styles.details}>
          <h4 className={styles.detailsTitle}>
            {SANTACASA_REGULARIZACOES_PAGE.labels.eventos}
          </h4>

          <ul className={styles.eventsList}>
            {eventos.map((evento) => (
              <SantaCasaRegularizacaoEvento key={evento.id} evento={evento} />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
