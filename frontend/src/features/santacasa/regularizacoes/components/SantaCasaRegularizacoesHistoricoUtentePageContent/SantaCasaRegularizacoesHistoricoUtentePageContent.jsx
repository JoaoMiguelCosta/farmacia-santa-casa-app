import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import SantaCasaRegularizacoesState from "../SantaCasaRegularizacoesList/SantaCasaRegularizacoesState";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";
import { useSantaCasaRegularizacoesHistoricoUtente } from "../../hooks/useSantaCasaRegularizacoesHistoricoUtente";

import { groupRegularizacoesHistoricoByDate } from "../../utils/santaCasaRegularizacoes.utils";
import {
  INITIAL_VISIBLE_HISTORY,
  VISIBLE_HISTORY_INCREMENT,
  filterHistoricoRegularizacoes,
  getUtenteTitle,
} from "../../utils/santaCasaRegularizacoesHistoricoUtente.utils";

import SantaCasaRegularizacoesHistoricoSummary from "./SantaCasaRegularizacoesHistoricoSummary";
import SantaCasaRegularizacoesHistoricoList from "./SantaCasaRegularizacoesHistoricoList";

import styles from "./SantaCasaRegularizacoesHistoricoUtentePageContent.module.css";

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

  const filteredRegularizacoes = useMemo(
    () =>
      filterHistoricoRegularizacoes({
        regularizacoes,
        search: historySearch,
        from: fromFilter,
        to: toFilter,
      }),
    [regularizacoes, historySearch, fromFilter, toFilter],
  );

  const displayedRegularizacoes = useMemo(
    () => filteredRegularizacoes.slice(0, visibleCount),
    [filteredRegularizacoes, visibleCount],
  );

  const displayedDateGroups = useMemo(
    () => groupRegularizacoesHistoricoByDate(displayedRegularizacoes),
    [displayedRegularizacoes],
  );

  const hiddenHistoryCount = Math.max(
    0,
    filteredRegularizacoes.length - displayedRegularizacoes.length,
  );

  const nextVisibleHistoryCount = Math.min(
    VISIBLE_HISTORY_INCREMENT,
    hiddenHistoryCount,
  );

  const hasActiveFilters =
    Boolean(historySearch.trim()) ||
    Boolean(fromFilter.trim()) ||
    Boolean(toFilter.trim());

  const canShowMore = hiddenHistoryCount > 0;
  const canShowLess =
    visibleCount > INITIAL_VISIBLE_HISTORY &&
    filteredRegularizacoes.length > INITIAL_VISIBLE_HISTORY;

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
    setVisibleCount((currentVisibleCount) =>
      Math.min(
        currentVisibleCount + VISIBLE_HISTORY_INCREMENT,
        filteredRegularizacoes.length,
      ),
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
        title={getUtenteTitle(summary)}
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

          <SantaCasaRegularizacoesHistoricoList
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
