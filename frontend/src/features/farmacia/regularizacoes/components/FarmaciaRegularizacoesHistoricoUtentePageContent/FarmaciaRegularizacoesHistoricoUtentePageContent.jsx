import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import { FARMACIA_ROUTES } from "../../../shared/config/farmaciaRoutes.config";

import FarmaciaRegularizacoesState from "../FarmaciaRegularizacoesState/FarmaciaRegularizacoesState";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";
import { useFarmaciaRegularizacoesHistoricoUtente } from "../../hooks/useFarmaciaRegularizacoesHistoricoUtente";

import {
  INITIAL_VISIBLE_HISTORY,
  VISIBLE_HISTORY_INCREMENT,
  sortHistoricoRegularizacoes,
  filterHistoricoRegularizacoes,
  groupHistoricoByDate,
  getUtenteTitle,
} from "../../utils/farmaciaRegularizacoesHistoricoUtente.utils";

import FarmaciaRegularizacoesHistoricoSummary from "./FarmaciaRegularizacoesHistoricoSummary";
import FarmaciaRegularizacoesHistoricoList from "./FarmaciaRegularizacoesHistoricoList";

import styles from "./FarmaciaRegularizacoesHistoricoUtentePageContent.module.css";

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

  const sortedRegularizacoes = useMemo(
    () => sortHistoricoRegularizacoes(regularizacoes),
    [regularizacoes],
  );

  const filteredRegularizacoes = useMemo(
    () =>
      filterHistoricoRegularizacoes({
        regularizacoes: sortedRegularizacoes,
        search: historySearch,
        from: fromFilter,
        to: toFilter,
      }),
    [fromFilter, historySearch, sortedRegularizacoes, toFilter],
  );

  const displayedRegularizacoes = useMemo(
    () => filteredRegularizacoes.slice(0, visibleCount),
    [filteredRegularizacoes, visibleCount],
  );

  const displayedDateGroups = useMemo(
    () => groupHistoricoByDate(displayedRegularizacoes),
    [displayedRegularizacoes],
  );

  const hiddenCount = Math.max(
    0,
    filteredRegularizacoes.length - displayedRegularizacoes.length,
  );

  const nextVisibleCount = Math.min(VISIBLE_HISTORY_INCREMENT, hiddenCount);

  const hasActiveFilters =
    Boolean(historySearch.trim()) || Boolean(fromFilter) || Boolean(toFilter);

  const canShowMore = hiddenCount > 0;
  const canShowLess =
    visibleCount > INITIAL_VISIBLE_HISTORY &&
    filteredRegularizacoes.length > INITIAL_VISIBLE_HISTORY;

  const historyResultsLabel =
    FARMACIA_REGULARIZACOES_PAGE.historyDetails.getHistoryResultsLabel({
      visible: displayedRegularizacoes.length,
      filtered: filteredRegularizacoes.length,
      total: regularizacoes.length,
    });

  const viewMoreHistoryLabel =
    FARMACIA_REGULARIZACOES_PAGE.historyDetails.getViewMoreHistoryLabel({
      count: nextVisibleCount,
    });

  const hiddenHistoryLabel =
    FARMACIA_REGULARIZACOES_PAGE.historyDetails.getHiddenHistoryLabel({
      hidden: hiddenCount,
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
    setVisibleCount((prev) =>
      Math.min(prev + VISIBLE_HISTORY_INCREMENT, filteredRegularizacoes.length),
    );
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
        to={FARMACIA_ROUTES.regularizacoesHistorico}
        className={styles.backLink}
      >
        {FARMACIA_REGULARIZACOES_PAGE.historyDetails.backLabel}
      </Link>

      <PageHeader
        titleId="farmacia-regularizacoes-historico-utente-title"
        eyebrow={FARMACIA_REGULARIZACOES_PAGE.historyDetails.eyebrow}
        title={getUtenteTitle(summary)}
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

          <FarmaciaRegularizacoesHistoricoList
            displayedDateGroups={displayedDateGroups}
            hasVisibleRegularizacoes={displayedRegularizacoes.length > 0}
            hasActiveFilters={hasActiveFilters}
            canShowMore={canShowMore}
            canShowLess={canShowLess}
            historySearch={historySearch}
            fromFilter={fromFilter}
            toFilter={toFilter}
            historyResultsLabel={historyResultsLabel}
            viewMoreHistoryLabel={viewMoreHistoryLabel}
            hiddenHistoryLabel={hiddenHistoryLabel}
            isRefreshing={isRefreshing}
            onRefresh={refreshHistorico}
            onUpdateSearch={updateHistorySearch}
            onUpdateFrom={updateFromFilter}
            onUpdateTo={updateToFilter}
            onClearFilters={clearHistoryFilters}
            onShowMore={showMoreHistory}
            onShowAll={showAllHistory}
            onShowLess={showLessHistory}
          />
        </>
      )}
    </section>
  );
}
