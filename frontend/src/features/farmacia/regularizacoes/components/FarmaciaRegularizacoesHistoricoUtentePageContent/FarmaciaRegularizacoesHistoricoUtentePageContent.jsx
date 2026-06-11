import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import FarmaciaRegularizacaoCard from "../FarmaciaRegularizacaoCard/FarmaciaRegularizacaoCard";
import FarmaciaRegularizacoesState from "../FarmaciaRegularizacoesState/FarmaciaRegularizacoesState";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";
import { useFarmaciaRegularizacoesHistoricoUtente } from "../../hooks/useFarmaciaRegularizacoesHistoricoUtente";

import {
  getRegularizacaoEventos,
  getRegularizacaoQuantidadeRegularizada,
} from "../../utils/farmaciaRegularizacoes.utils";

import styles from "./FarmaciaRegularizacoesHistoricoUtentePageContent.module.css";

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

function getDateTimestamp(value) {
  const date = getSafeDate(value);

  return date ? date.getTime() : 0;
}

function getDateInputTimestamp(value, endOfDay = false) {
  if (!value) return null;

  const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  const date = new Date(`${value}${suffix}`);

  if (Number.isNaN(date.getTime())) return null;

  return date.getTime();
}

function getDateKey(value) {
  const date = getSafeDate(value);

  if (!date) return "sem-data";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateLabel(value) {
  const date = getSafeDate(value);

  if (!date) return UNKNOWN_LABEL;

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getRegularizacaoActivityDate(regularizacao) {
  return regularizacao?.updatedAt || regularizacao?.createdAt;
}

function getPedidoNumero(regularizacao) {
  const pedidoNumero = Number(
    regularizacao?.pedidoNumero ?? regularizacao?.pedido?.numero,
  );

  if (!Number.isFinite(pedidoNumero)) return null;

  return pedidoNumero;
}

function getEventoSearchText(evento) {
  const receita = evento?.receitaLinha?.receita;

  return [
    evento?.receitaLinha?.nome,
    receita?.numero19,
    receita?.pinAcesso6,
    receita?.pinOpcao4,
  ]
    .filter(Boolean)
    .join(" ");
}

function getRegularizacaoSearchText(regularizacao) {
  const pedidoNumero = getPedidoNumero(regularizacao);
  const eventosText = getRegularizacaoEventos(regularizacao)
    .map(getEventoSearchText)
    .join(" ");

  return normalizeSearchText(
    [
      regularizacao?.medicamento,
      regularizacao?.medicamentoNorm,
      regularizacao?.status,
      FARMACIA_REGULARIZACOES_PAGE.status[regularizacao?.status],
      pedidoNumero ? `#${pedidoNumero} ${pedidoNumero}` : "",
      eventosText,
    ].join(" "),
  );
}

function sortHistoricoRegularizacoes(regularizacoes = []) {
  return [...regularizacoes].sort((a, b) => {
    const dateDiff =
      getDateTimestamp(getRegularizacaoActivityDate(b)) -
      getDateTimestamp(getRegularizacaoActivityDate(a));

    if (dateDiff !== 0) return dateDiff;

    const pedidoDiff = (getPedidoNumero(b) || 0) - (getPedidoNumero(a) || 0);

    if (pedidoDiff !== 0) return pedidoDiff;

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
  const fromTimestamp = getDateInputTimestamp(from);
  const toTimestamp = getDateInputTimestamp(to, true);

  return regularizacoes.filter((regularizacao) => {
    const activityTimestamp = getDateTimestamp(
      getRegularizacaoActivityDate(regularizacao),
    );

    if (fromTimestamp && activityTimestamp < fromTimestamp) {
      return false;
    }

    if (toTimestamp && activityTimestamp > toTimestamp) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return getRegularizacaoSearchText(regularizacao).includes(normalizedSearch);
  });
}

function groupHistoricoByDate(regularizacoes = []) {
  const groupsMap = new Map();

  sortHistoricoRegularizacoes(regularizacoes).forEach((regularizacao) => {
    const dateValue = getRegularizacaoActivityDate(regularizacao);
    const key = getDateKey(dateValue);

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        dateValue,
        dateLabel: getDateLabel(dateValue),
        regularizacoes: [],
        totalRegularizada: 0,
        totalEventos: 0,
      });
    }

    const group = groupsMap.get(key);

    group.regularizacoes.push(regularizacao);
    group.totalRegularizada +=
      getRegularizacaoQuantidadeRegularizada(regularizacao);
    group.totalEventos += getRegularizacaoEventos(regularizacao).length;
  });

  return Array.from(groupsMap.values()).sort((a, b) => {
    return getDateTimestamp(b.dateValue) - getDateTimestamp(a.dateValue);
  });
}

function getUtenteTitle(summary) {
  return (
    summary?.utente?.nome ||
    FARMACIA_REGULARIZACOES_PAGE.historyDetails.titleFallback
  );
}

function getUtenteNumber(summary) {
  return summary?.utente?.numero9 || UNKNOWN_LABEL;
}

function getPedidosLabel(pedidoNumbers = []) {
  if (pedidoNumbers.length === 0) return UNKNOWN_LABEL;

  return pedidoNumbers.map((numero) => `#${numero}`).join(", ");
}

function FarmaciaRegularizacoesHistoricoSummary({ summary }) {
  if (!summary) return null;

  return (
    <section
      className={styles.summary}
      aria-label={FARMACIA_REGULARIZACOES_PAGE.historyDetails.summaryAriaLabel}
    >
      <div className={styles.summaryFocus}>
        <span>
          {FARMACIA_REGULARIZACOES_PAGE.labels.regularizacoesConcluidas}
        </span>
        <strong>{summary.totalRegularizacoes}</strong>
      </div>

      <dl className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.utenteNumber}</dt>
          <dd>{getUtenteNumber(summary)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.unidadesRegularizadas}</dt>
          <dd>{summary.totalUnidadesRegularizadas}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.receitasUsadas}</dt>
          <dd>{summary.totalReceitasUsadas}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{summary.totalPedidos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.ultimaRegularizacao}</dt>
          <dd>{summary.latestActivityLabel}</dd>
        </div>
      </dl>

      <div className={styles.pedidos}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(summary.pedidoNumbers)}</strong>
      </div>
    </section>
  );
}

export default function FarmaciaRegularizacoesHistoricoUtentePageContent() {
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
  } = useFarmaciaRegularizacoesHistoricoUtente();

  const sortedRegularizacoes = useMemo(() => {
    return sortHistoricoRegularizacoes(regularizacoes);
  }, [regularizacoes]);

  const filteredRegularizacoes = useMemo(() => {
    return filterHistoricoRegularizacoes({
      regularizacoes: sortedRegularizacoes,
      search: historySearch,
      from: fromFilter,
      to: toFilter,
    });
  }, [fromFilter, historySearch, sortedRegularizacoes, toFilter]);

  const displayedRegularizacoes = useMemo(() => {
    return filteredRegularizacoes.slice(0, visibleCount);
  }, [filteredRegularizacoes, visibleCount]);

  const displayedDateGroups = useMemo(() => {
    return groupHistoricoByDate(displayedRegularizacoes);
  }, [displayedRegularizacoes]);

  const hiddenRegularizacoesCount = Math.max(
    0,
    filteredRegularizacoes.length - displayedRegularizacoes.length,
  );

  const nextVisibleHistoryCount = Math.min(
    VISIBLE_HISTORY_INCREMENT,
    hiddenRegularizacoesCount,
  );

  const hasVisibleRegularizacoes = displayedRegularizacoes.length > 0;

  const hasActiveFilters =
    Boolean(historySearch.trim()) || Boolean(fromFilter) || Boolean(toFilter);

  const canShowMore = hiddenRegularizacoesCount > 0;

  const canShowLess =
    visibleCount > INITIAL_VISIBLE_HISTORY &&
    filteredRegularizacoes.length > INITIAL_VISIBLE_HISTORY;

  const title = getUtenteTitle(summary);

  const historyResultsLabel =
    FARMACIA_REGULARIZACOES_PAGE.historyDetails.getHistoryResultsLabel({
      visible: displayedRegularizacoes.length,
      filtered: filteredRegularizacoes.length,
      total: regularizacoes.length,
    });

  const viewMoreHistoryLabel =
    FARMACIA_REGULARIZACOES_PAGE.historyDetails.getViewMoreHistoryLabel({
      count: nextVisibleHistoryCount,
    });

  const hiddenHistoryLabel =
    FARMACIA_REGULARIZACOES_PAGE.historyDetails.getHiddenHistoryLabel({
      hidden: hiddenRegularizacoesCount,
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
      aria-labelledby="farmacia-regularizacoes-historico-utente-title"
    >
      <Link
        to="/farmacia/regularizacoes?view=history"
        className={styles.backLink}
      >
        {FARMACIA_REGULARIZACOES_PAGE.historyDetails.backLabel}
      </Link>

      <PageHeader
        titleId="farmacia-regularizacoes-historico-utente-title"
        eyebrow={FARMACIA_REGULARIZACOES_PAGE.historyDetails.eyebrow}
        title={title}
        description={FARMACIA_REGULARIZACOES_PAGE.historyDetails.description}
      />

      {isLoading ? (
        <FarmaciaRegularizacoesState
          title={FARMACIA_REGULARIZACOES_PAGE.historyDetails.loadingTitle}
          description={
            FARMACIA_REGULARIZACOES_PAGE.historyDetails.loadingDescription
          }
        />
      ) : error ? (
        <FarmaciaRegularizacoesState
          title={FARMACIA_REGULARIZACOES_PAGE.historyDetails.errorTitle}
          description={error}
          actionLabel={FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
          onAction={refreshHistorico}
        />
      ) : !hasRegularizacoes || !summary ? (
        <FarmaciaRegularizacoesState
          title={FARMACIA_REGULARIZACOES_PAGE.historyDetails.emptyTitle}
          description={
            FARMACIA_REGULARIZACOES_PAGE.historyDetails.emptyDescription
          }
        />
      ) : (
        <>
          <FarmaciaRegularizacoesHistoricoSummary summary={summary} />

          <section className={styles.history}>
            <header className={styles.sectionHeader}>
              <div className={styles.heading}>
                <h2 className={styles.sectionTitle}>
                  {FARMACIA_REGULARIZACOES_PAGE.historyDetails.listTitle}
                </h2>

                <p className={styles.sectionDescription}>
                  {FARMACIA_REGULARIZACOES_PAGE.historyDetails.listDescription}
                </p>
              </div>

              <button
                type="button"
                className={styles.refreshButton}
                disabled={isRefreshing}
                onClick={refreshHistorico}
              >
                {isRefreshing
                  ? FARMACIA_REGULARIZACOES_PAGE.actions.refreshing
                  : FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
              </button>
            </header>

            <div
              className={styles.controls}
              aria-label={
                FARMACIA_REGULARIZACOES_PAGE.historyDetails.controlsAriaLabel
              }
            >
              <label className={styles.controlField}>
                <span>
                  {FARMACIA_REGULARIZACOES_PAGE.historyDetails.searchLabel}
                </span>

                <input
                  type="search"
                  value={historySearch}
                  placeholder={
                    FARMACIA_REGULARIZACOES_PAGE.historyDetails
                      .searchPlaceholder
                  }
                  onChange={(event) => updateHistorySearch(event.target.value)}
                />
              </label>

              <label className={styles.controlField}>
                <span>
                  {FARMACIA_REGULARIZACOES_PAGE.historyDetails.fromLabel}
                </span>

                <input
                  type="date"
                  value={fromFilter}
                  onChange={(event) => updateFromFilter(event.target.value)}
                />
              </label>

              <label className={styles.controlField}>
                <span>
                  {FARMACIA_REGULARIZACOES_PAGE.historyDetails.toLabel}
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
                {FARMACIA_REGULARIZACOES_PAGE.actions.clearHistoryFilters}
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
                              FARMACIA_REGULARIZACOES_PAGE.historyDetails
                                .dateGroupLabel
                            }
                          </span>

                          <h3>{group.dateLabel}</h3>
                        </div>

                        <dl className={styles.dateStats}>
                          <div>
                            <dt>
                              {
                                FARMACIA_REGULARIZACOES_PAGE.labels
                                  .regularizacoesConcluidas
                              }
                            </dt>
                            <dd>{group.regularizacoes.length}</dd>
                          </div>

                          <div>
                            <dt>
                              {
                                FARMACIA_REGULARIZACOES_PAGE.labels
                                  .unidadesRegularizadas
                              }
                            </dt>
                            <dd>{group.totalRegularizada}</dd>
                          </div>

                          <div>
                            <dt>
                              {FARMACIA_REGULARIZACOES_PAGE.labels.eventos}
                            </dt>
                            <dd>{group.totalEventos}</dd>
                          </div>
                        </dl>
                      </header>

                      <div className={styles.cards}>
                        {group.regularizacoes.map((regularizacao) => (
                          <FarmaciaRegularizacaoCard
                            key={regularizacao.id}
                            regularizacao={regularizacao}
                            variant="history"
                            showUtente={false}
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
                          {FARMACIA_REGULARIZACOES_PAGE.actions.viewAllHistory}
                        </button>
                      </>
                    ) : null}

                    {canShowLess ? (
                      <button
                        type="button"
                        className={styles.listButton}
                        onClick={showLessHistory}
                      >
                        {FARMACIA_REGULARIZACOES_PAGE.actions.showLessHistory}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyResults}>
                <strong>
                  {
                    FARMACIA_REGULARIZACOES_PAGE.historyDetails
                      .emptyResultsTitle
                  }
                </strong>

                <span>
                  {
                    FARMACIA_REGULARIZACOES_PAGE.historyDetails
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
