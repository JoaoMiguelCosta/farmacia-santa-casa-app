import FarmaciaRegularizacaoCard from "../FarmaciaRegularizacaoCard/FarmaciaRegularizacaoCard";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";

import Button from "../../../../../shared/ui/Button/Button";

import styles from "./FarmaciaRegularizacoesHistoricoUtentePageContent.module.css";

export default function FarmaciaRegularizacoesHistoricoList({
  displayedDateGroups,
  hasVisibleRegularizacoes,
  hasActiveFilters,
  canShowMore,
  canShowLess,
  historySearch,
  fromFilter,
  toFilter,
  historyResultsLabel,
  viewMoreHistoryLabel,
  hiddenHistoryLabel,
  isRefreshing,
  onRefresh,
  onUpdateSearch,
  onUpdateFrom,
  onUpdateTo,
  onClearFilters,
  onShowMore,
  onShowAll,
  onShowLess,
}) {
  return (
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

        <Button
          variant="secondary"
          size="sm"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing
            ? FARMACIA_REGULARIZACOES_PAGE.actions.refreshing
            : FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
        </Button>
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
              FARMACIA_REGULARIZACOES_PAGE.historyDetails.searchPlaceholder
            }
            onChange={(event) => onUpdateSearch(event.target.value)}
          />
        </label>

        <label className={styles.controlField}>
          <span>
            {FARMACIA_REGULARIZACOES_PAGE.historyDetails.fromLabel}
          </span>

          <input
            type="date"
            value={fromFilter}
            onChange={(event) => onUpdateFrom(event.target.value)}
          />
        </label>

        <label className={styles.controlField}>
          <span>
            {FARMACIA_REGULARIZACOES_PAGE.historyDetails.toLabel}
          </span>

          <input
            type="date"
            value={toFilter}
            onChange={(event) => onUpdateTo(event.target.value)}
          />
        </label>

        <button
          type="button"
          className={styles.clearButton}
          disabled={!hasActiveFilters}
          onClick={onClearFilters}
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
                      <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.eventos}</dt>
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
                  <span className={styles.hiddenMeta}>{hiddenHistoryLabel}</span>

                  <button
                    type="button"
                    className={styles.listButton}
                    onClick={onShowMore}
                  >
                    {viewMoreHistoryLabel}
                  </button>

                  <button
                    type="button"
                    className={styles.listButton}
                    onClick={onShowAll}
                  >
                    {FARMACIA_REGULARIZACOES_PAGE.actions.viewAllHistory}
                  </button>
                </>
              ) : null}

              {canShowLess ? (
                <button
                  type="button"
                  className={styles.listButton}
                  onClick={onShowLess}
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
            {FARMACIA_REGULARIZACOES_PAGE.historyDetails.emptyResultsTitle}
          </strong>

          <span>
            {FARMACIA_REGULARIZACOES_PAGE.historyDetails.emptyResultsDescription}
          </span>
        </div>
      )}
    </section>
  );
}
