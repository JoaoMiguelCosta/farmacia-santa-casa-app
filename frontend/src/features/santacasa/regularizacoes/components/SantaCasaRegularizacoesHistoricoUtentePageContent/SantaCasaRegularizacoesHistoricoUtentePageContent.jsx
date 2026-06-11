import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import SantaCasaRegularizacaoCard from "../SantaCasaRegularizacaoCard/SantaCasaRegularizacaoCard";
import SantaCasaRegularizacoesState from "../SantaCasaRegularizacoesList/SantaCasaRegularizacoesState";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";
import { useSantaCasaRegularizacoesHistoricoUtente } from "../../hooks/useSantaCasaRegularizacoesHistoricoUtente";
import {
  getRegularizacaoEventos,
  groupRegularizacoesHistoricoByDate,
} from "../../utils/santaCasaRegularizacoes.utils";

import styles from "./SantaCasaRegularizacoesHistoricoUtentePageContent.module.css";

const UNKNOWN_LABEL = "—";

const INITIAL_VISIBLE_HISTORY = 5;
const VISIBLE_HISTORY_INCREMENT = 5;

function normalizeSearchText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function getSafeDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getActivityDate(regularizacao) {
  return regularizacao?.updatedAt || regularizacao?.createdAt;
}

function getActivityTimestamp(regularizacao) {
  const date = getSafeDate(getActivityDate(regularizacao));

  return date ? date.getTime() : 0;
}

function getDateInputTimestamp(value, boundary = "start") {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) return null;

  const [year, month, day] = normalizedValue.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date =
    boundary === "end"
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

  return date.getTime();
}

function getUtenteTitle(summary) {
  return (
    summary?.utente?.nome ||
    SANTACASA_REGULARIZACOES_PAGE.historyDetails.titleFallback
  );
}

function getUtenteNumber(summary) {
  return summary?.utente?.numero9 || UNKNOWN_LABEL;
}

function getPedidosLabel(pedidoNumbers = []) {
  if (pedidoNumbers.length === 0) return UNKNOWN_LABEL;

  return pedidoNumbers.map((numero) => `#${numero}`).join(", ");
}

function getRegularizacaoPedidoSearchText(regularizacao) {
  const pedidoNumero =
    regularizacao?.pedidoNumero ?? regularizacao?.pedido?.numero;

  if (!pedidoNumero) return "";

  return `#${pedidoNumero} ${pedidoNumero}`;
}

function getEventosSearchText(regularizacao) {
  return getRegularizacaoEventos(regularizacao)
    .map((evento) => {
      return [
        evento?.receitaLinha?.nome,
        evento?.receitaLinha?.receita?.numero19,
        evento?.receitaLinha?.receita?.pinAcesso6,
        evento?.receitaLinha?.receita?.pinOpcao4,
        evento?.quantidade,
        evento?.createdAt,
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join(" ");
}

function getRegularizacaoSearchText(regularizacao) {
  return normalizeSearchText(
    [
      regularizacao?.medicamento,
      regularizacao?.medicamentoNorm,
      regularizacao?.status,
      SANTACASA_REGULARIZACOES_PAGE.status[regularizacao?.status],
      getRegularizacaoPedidoSearchText(regularizacao),
      getEventosSearchText(regularizacao),
    ].join(" "),
  );
}

function isRegularizacaoInsideDateRange({ regularizacao, from, to }) {
  const timestamp = getActivityTimestamp(regularizacao);

  if (!timestamp) return false;

  const fromTimestamp = getDateInputTimestamp(from, "start");
  const toTimestamp = getDateInputTimestamp(to, "end");

  if (fromTimestamp && timestamp < fromTimestamp) return false;
  if (toTimestamp && timestamp > toTimestamp) return false;

  return true;
}

function sortRegularizacoesByActivity(regularizacoes = []) {
  return [...regularizacoes].sort((a, b) => {
    const dateDiff = getActivityTimestamp(b) - getActivityTimestamp(a);

    if (dateDiff !== 0) return dateDiff;

    return String(a?.medicamento || "").localeCompare(
      String(b?.medicamento || ""),
      "pt-PT",
      {
        sensitivity: "base",
      },
    );
  });
}

function filterHistoricoRegularizacoes({ regularizacoes, search, from, to }) {
  const normalizedSearch = normalizeSearchText(search);

  return sortRegularizacoesByActivity(regularizacoes).filter(
    (regularizacao) => {
      if (
        !isRegularizacaoInsideDateRange({
          regularizacao,
          from,
          to,
        })
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getRegularizacaoSearchText(regularizacao).includes(
        normalizedSearch,
      );
    },
  );
}

function SantaCasaRegularizacoesHistoricoSummary({ summary }) {
  if (!summary) return null;

  return (
    <section
      className={styles.summary}
      aria-label={SANTACASA_REGULARIZACOES_PAGE.historyDetails.summaryAriaLabel}
    >
      <div className={styles.summaryFocus}>
        <span>
          {SANTACASA_REGULARIZACOES_PAGE.labels.regularizacoesConcluidas}
        </span>
        <strong>{summary.totalRegularizacoes}</strong>
      </div>

      <dl className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.utenteNumber}</dt>
          <dd>{getUtenteNumber(summary)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.unidadesRegularizadas}</dt>
          <dd>{summary.totalUnidadesRegularizadas}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.receitasUsadas}</dt>
          <dd>{summary.totalReceitasUsadas}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{summary.totalPedidos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{SANTACASA_REGULARIZACOES_PAGE.labels.ultimaRegularizacao}</dt>
          <dd>{summary.latestActivityLabel}</dd>
        </div>
      </dl>

      <div className={styles.pedidos}>
        <span>{SANTACASA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(summary.pedidoNumbers)}</strong>
      </div>
    </section>
  );
}

export default function SantaCasaRegularizacoesHistoricoUtentePageContent() {
  const [historySearch, setHistorySearch] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_HISTORY);

  const {
    regularizacoes,
    summary,

    hasRegularizacoes,

    isLoading,
    isRefreshing,
    error,

    refreshHistorico,
  } = useSantaCasaRegularizacoesHistoricoUtente();

  const filteredRegularizacoes = useMemo(() => {
    return filterHistoricoRegularizacoes({
      regularizacoes,
      search: historySearch,
      from: fromFilter,
      to: toFilter,
    });
  }, [regularizacoes, historySearch, fromFilter, toFilter]);

  const displayedRegularizacoes = useMemo(() => {
    return filteredRegularizacoes.slice(0, visibleCount);
  }, [filteredRegularizacoes, visibleCount]);

  const displayedDateGroups = useMemo(() => {
    return groupRegularizacoesHistoricoByDate(displayedRegularizacoes);
  }, [displayedRegularizacoes]);

  const hiddenHistoryCount = Math.max(
    0,
    filteredRegularizacoes.length - displayedRegularizacoes.length,
  );

  const nextVisibleHistoryCount = Math.min(
    VISIBLE_HISTORY_INCREMENT,
    hiddenHistoryCount,
  );

  const hasVisibleRegularizacoes = displayedRegularizacoes.length > 0;

  const hasActiveFilters =
    Boolean(historySearch.trim()) ||
    Boolean(fromFilter.trim()) ||
    Boolean(toFilter.trim());

  const canShowMore = hiddenHistoryCount > 0;

  const canShowLess =
    visibleCount > INITIAL_VISIBLE_HISTORY &&
    filteredRegularizacoes.length > INITIAL_VISIBLE_HISTORY;

  const title = getUtenteTitle(summary);

  const historyResultsLabel =
    SANTACASA_REGULARIZACOES_PAGE.historyDetails.getHistoryResultsLabel({
      visible: displayedRegularizacoes.length,
      filtered: filteredRegularizacoes.length,
      total: regularizacoes.length,
    });

  const viewMoreHistoryLabel =
    SANTACASA_REGULARIZACOES_PAGE.historyDetails.getViewMoreHistoryLabel({
      count: nextVisibleHistoryCount,
    });

  const hiddenHistoryLabel =
    SANTACASA_REGULARIZACOES_PAGE.historyDetails.getHiddenHistoryLabel({
      hidden: hiddenHistoryCount,
    });

  function updateHistorySearch(value) {
    setHistorySearch(value);
    setVisibleCount(INITIAL_VISIBLE_HISTORY);
  }

  function updateFromFilter(value) {
    setFromFilter(value);
    setVisibleCount(INITIAL_VISIBLE_HISTORY);
  }

  function updateToFilter(value) {
    setToFilter(value);
    setVisibleCount(INITIAL_VISIBLE_HISTORY);
  }

  function clearHistoryFilters() {
    setHistorySearch("");
    setFromFilter("");
    setToFilter("");
    setVisibleCount(INITIAL_VISIBLE_HISTORY);
  }

  function showMoreHistory() {
    setVisibleCount((currentVisibleCount) => {
      return Math.min(
        currentVisibleCount + VISIBLE_HISTORY_INCREMENT,
        filteredRegularizacoes.length,
      );
    });
  }

  function showAllHistory() {
    setVisibleCount(filteredRegularizacoes.length);
  }

  function showLessHistory() {
    setVisibleCount(INITIAL_VISIBLE_HISTORY);
  }

  return (
    <section
      className={styles.page}
      aria-labelledby="santacasa-regularizacoes-historico-utente-title"
    >
      <Link
        to="/santacasa/regularizacoes?view=history"
        className={styles.backLink}
      >
        {SANTACASA_REGULARIZACOES_PAGE.historyDetails.backLabel}
      </Link>

      <PageHeader
        titleId="santacasa-regularizacoes-historico-utente-title"
        eyebrow={SANTACASA_REGULARIZACOES_PAGE.historyDetails.eyebrow}
        title={title}
        description={SANTACASA_REGULARIZACOES_PAGE.historyDetails.description}
      />

      {isLoading ? (
        <SantaCasaRegularizacoesState
          title={SANTACASA_REGULARIZACOES_PAGE.historyDetails.loadingTitle}
          description={
            SANTACASA_REGULARIZACOES_PAGE.historyDetails.loadingDescription
          }
        />
      ) : error ? (
        <SantaCasaRegularizacoesState
          title={SANTACASA_REGULARIZACOES_PAGE.historyDetails.errorTitle}
          description={error}
          actionLabel={SANTACASA_REGULARIZACOES_PAGE.actions.refresh}
          onAction={refreshHistorico}
        />
      ) : !hasRegularizacoes || !summary ? (
        <SantaCasaRegularizacoesState
          title={SANTACASA_REGULARIZACOES_PAGE.historyDetails.emptyTitle}
          description={
            SANTACASA_REGULARIZACOES_PAGE.historyDetails.emptyDescription
          }
        />
      ) : (
        <>
          <SantaCasaRegularizacoesHistoricoSummary summary={summary} />

          <section className={styles.history}>
            <header className={styles.sectionHeader}>
              <div className={styles.heading}>
                <h2 className={styles.sectionTitle}>
                  {SANTACASA_REGULARIZACOES_PAGE.historyDetails.listTitle}
                </h2>

                <p className={styles.sectionDescription}>
                  {SANTACASA_REGULARIZACOES_PAGE.historyDetails.listDescription}
                </p>
              </div>

              <button
                type="button"
                className={styles.refreshButton}
                disabled={isRefreshing}
                onClick={refreshHistorico}
              >
                {isRefreshing
                  ? SANTACASA_REGULARIZACOES_PAGE.actions.refreshing
                  : SANTACASA_REGULARIZACOES_PAGE.actions.refresh}
              </button>
            </header>

            <div
              className={styles.controls}
              aria-label={
                SANTACASA_REGULARIZACOES_PAGE.historyDetails.controlsAriaLabel
              }
            >
              <label className={styles.controlField}>
                <span>
                  {SANTACASA_REGULARIZACOES_PAGE.historyDetails.searchLabel}
                </span>

                <input
                  type="search"
                  value={historySearch}
                  placeholder={
                    SANTACASA_REGULARIZACOES_PAGE.historyDetails
                      .searchPlaceholder
                  }
                  onChange={(event) => updateHistorySearch(event.target.value)}
                />
              </label>

              <label className={styles.controlField}>
                <span>
                  {SANTACASA_REGULARIZACOES_PAGE.historyDetails.fromLabel}
                </span>

                <input
                  type="date"
                  value={fromFilter}
                  onChange={(event) => updateFromFilter(event.target.value)}
                />
              </label>

              <label className={styles.controlField}>
                <span>
                  {SANTACASA_REGULARIZACOES_PAGE.historyDetails.toLabel}
                </span>

                <input
                  type="date"
                  value={toFilter}
                  onChange={(event) => updateToFilter(event.target.value)}
                />
              </label>

              <button
                type="button"
                className={styles.clearButton}
                disabled={!hasActiveFilters}
                onClick={clearHistoryFilters}
              >
                {SANTACASA_REGULARIZACOES_PAGE.actions.clearHistoryFilters}
              </button>

              <p className={styles.resultsMeta}>{historyResultsLabel}</p>
            </div>

            {hasVisibleRegularizacoes ? (
              <>
                <div className={styles.dateGroups}>
                  {displayedDateGroups.map((group) => (
                    <section key={group.key} className={styles.dateGroup}>
                      <header className={styles.dateHeader}>
                        <div className={styles.dateIdentity}>
                          <span>
                            {
                              SANTACASA_REGULARIZACOES_PAGE.historyDetails
                                .dateGroupLabel
                            }
                          </span>

                          <h3>{group.dateLabel}</h3>
                        </div>

                        <dl className={styles.dateStats}>
                          <div>
                            <dt>
                              {
                                SANTACASA_REGULARIZACOES_PAGE.labels
                                  .regularizacoesConcluidas
                              }
                            </dt>
                            <dd>{group.regularizacoes.length}</dd>
                          </div>

                          <div>
                            <dt>
                              {
                                SANTACASA_REGULARIZACOES_PAGE.labels
                                  .unidadesRegularizadas
                              }
                            </dt>
                            <dd>{group.totalRegularizada}</dd>
                          </div>

                          <div>
                            <dt>
                              {SANTACASA_REGULARIZACOES_PAGE.labels.eventos}
                            </dt>
                            <dd>{group.totalEventos}</dd>
                          </div>
                        </dl>
                      </header>

                      <div className={styles.cards}>
                        {group.regularizacoes.map((regularizacao) => (
                          <SantaCasaRegularizacaoCard
                            key={regularizacao.id}
                            regularizacao={regularizacao}
                            variant="history"
                            isGrouped
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {canShowMore || canShowLess ? (
                  <div className={styles.listActions}>
                    {canShowMore ? (
                      <>
                        <span className={styles.hiddenMeta}>
                          {hiddenHistoryLabel}
                        </span>

                        <button
                          type="button"
                          className={styles.listButton}
                          onClick={showMoreHistory}
                        >
                          {viewMoreHistoryLabel}
                        </button>

                        <button
                          type="button"
                          className={styles.listButton}
                          onClick={showAllHistory}
                        >
                          {
                            SANTACASA_REGULARIZACOES_PAGE.actions
                              .viewAllRegularizacoes
                          }
                        </button>
                      </>
                    ) : null}

                    {canShowLess ? (
                      <button
                        type="button"
                        className={styles.listButton}
                        onClick={showLessHistory}
                      >
                        {
                          SANTACASA_REGULARIZACOES_PAGE.actions
                            .showLessRegularizacoes
                        }
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyResults}>
                <strong>
                  {
                    SANTACASA_REGULARIZACOES_PAGE.historyDetails
                      .emptyResultsTitle
                  }
                </strong>

                <span>
                  {
                    SANTACASA_REGULARIZACOES_PAGE.historyDetails
                      .emptyResultsDescription
                  }
                </span>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
