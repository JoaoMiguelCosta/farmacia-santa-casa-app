import { Link } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";
import Button from "../../../../../shared/ui/Button/Button";

import { FARMACIA_ROUTES } from "../../../shared/config/farmaciaRoutes.config";

import FarmaciaRegularizacaoCard from "../FarmaciaRegularizacaoCard/FarmaciaRegularizacaoCard";
import FarmaciaRegularizacoesState from "../FarmaciaRegularizacoesState/FarmaciaRegularizacoesState";
import FarmaciaRegularizacoesUtenteSummary from "../FarmaciaRegularizacoesUtenteSummary/FarmaciaRegularizacoesUtenteSummary";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";
import { useFarmaciaRegularizacoesUtente } from "../../hooks/useFarmaciaRegularizacoesUtente";
import { useFarmaciaRegularizacoesUtenteFilters } from "../../hooks/useFarmaciaRegularizacoesUtenteFilters";
import {
  DETAILS_STATUS_OPTIONS,
  getUtenteTitle,
} from "../../utils/farmaciaRegularizacoesUtente.utils";

import styles from "./FarmaciaRegularizacoesUtentePageContent.module.css";

export default function FarmaciaRegularizacoesUtentePageContent() {
  const {
    group,
    hasRegularizacoes,
    isLoading,
    isRefreshing,
    error,
    refreshRegularizacoes,
  } = useFarmaciaRegularizacoesUtente();

  const medicamentos = group?.medicamentos || [];

  const {
    medicamentoSearch,
    statusFilter,
    displayedMedicamentos,
    hasVisibleMedicamentos,
    hasActiveFilters,
    canShowMore,
    canShowLess,
    medicinesResultsLabel,
    viewMoreMedicinesLabel,
    hiddenMedicinesLabel,
    updateMedicamentoSearch,
    updateStatusFilter,
    clearDetailsFilters,
    showMoreMedicamentos,
    showAllMedicamentos,
    showLessMedicamentos,
  } = useFarmaciaRegularizacoesUtenteFilters({ medicamentos });

  const title = getUtenteTitle(group);

  return (
    <section
      className={styles.page}
      aria-labelledby="farmacia-regularizacoes-utente-title"
    >
      <Link to={FARMACIA_ROUTES.regularizacoes} className={styles.backLink}>
        {FARMACIA_REGULARIZACOES_PAGE.details.backLabel}
      </Link>

      <PageHeader
        titleId="farmacia-regularizacoes-utente-title"
        eyebrow={FARMACIA_REGULARIZACOES_PAGE.details.eyebrow}
        title={title}
        description={FARMACIA_REGULARIZACOES_PAGE.details.description}
      />

      {isLoading ? (
        <FarmaciaRegularizacoesState
          title={FARMACIA_REGULARIZACOES_PAGE.details.loadingTitle}
          description={FARMACIA_REGULARIZACOES_PAGE.details.loadingDescription}
        />
      ) : error ? (
        <FarmaciaRegularizacoesState
          title={FARMACIA_REGULARIZACOES_PAGE.details.errorTitle}
          description={error}
          actionLabel={FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
          onAction={refreshRegularizacoes}
        />
      ) : !hasRegularizacoes || !group ? (
        <FarmaciaRegularizacoesState
          title={FARMACIA_REGULARIZACOES_PAGE.details.emptyTitle}
          description={FARMACIA_REGULARIZACOES_PAGE.details.emptyDescription}
        />
      ) : (
        <>
          <FarmaciaRegularizacoesUtenteSummary group={group} />

          <section className={styles.medicamentos}>
            <header className={styles.sectionHeader}>
              <div className={styles.heading}>
                <h2 className={styles.sectionTitle}>
                  {FARMACIA_REGULARIZACOES_PAGE.details.medicinesTitle}
                </h2>

                <p className={styles.sectionDescription}>
                  {FARMACIA_REGULARIZACOES_PAGE.details.medicinesDescription}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={isRefreshing}
                onClick={refreshRegularizacoes}
              >
                {isRefreshing
                  ? FARMACIA_REGULARIZACOES_PAGE.actions.refreshing
                  : FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
              </Button>
            </header>

            <div
              className={styles.controls}
              aria-label={FARMACIA_REGULARIZACOES_PAGE.details.controlsAriaLabel}
            >
              <label className={styles.controlField}>
                <span>{FARMACIA_REGULARIZACOES_PAGE.details.searchLabel}</span>

                <input
                  type="search"
                  value={medicamentoSearch}
                  placeholder={FARMACIA_REGULARIZACOES_PAGE.details.searchPlaceholder}
                  onChange={(event) => updateMedicamentoSearch(event.target.value)}
                />
              </label>

              <label className={styles.controlField}>
                <span>{FARMACIA_REGULARIZACOES_PAGE.details.statusLabel}</span>

                <select
                  value={statusFilter}
                  onChange={(event) => updateStatusFilter(event.target.value)}
                >
                  {DETAILS_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className={styles.clearButton}
                disabled={!hasActiveFilters}
                onClick={clearDetailsFilters}
              >
                {FARMACIA_REGULARIZACOES_PAGE.actions.clearDetailsFilters}
              </button>

              <p className={styles.resultsMeta}>{medicinesResultsLabel}</p>
            </div>

            {hasVisibleMedicamentos ? (
              <>
                <div className={styles.cards}>
                  {displayedMedicamentos.map((regularizacao) => (
                    <FarmaciaRegularizacaoCard
                      key={regularizacao.id}
                      regularizacao={regularizacao}
                      variant="pending"
                      showUtente={false}
                    />
                  ))}
                </div>

                {canShowMore || canShowLess ? (
                  <div className={styles.listActions}>
                    {canShowMore ? (
                      <>
                        <span className={styles.hiddenMeta}>
                          {hiddenMedicinesLabel}
                        </span>

                        <button
                          type="button"
                          className={styles.listButton}
                          onClick={showMoreMedicamentos}
                        >
                          {viewMoreMedicinesLabel}
                        </button>

                        <button
                          type="button"
                          className={styles.listButton}
                          onClick={showAllMedicamentos}
                        >
                          {FARMACIA_REGULARIZACOES_PAGE.actions.viewAllMedicamentos}
                        </button>
                      </>
                    ) : null}

                    {canShowLess ? (
                      <button
                        type="button"
                        className={styles.listButton}
                        onClick={showLessMedicamentos}
                      >
                        {FARMACIA_REGULARIZACOES_PAGE.actions.showLessMedicamentos}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyResults}>
                <strong>
                  {FARMACIA_REGULARIZACOES_PAGE.details.emptyResultsTitle}
                </strong>

                <span>
                  {FARMACIA_REGULARIZACOES_PAGE.details.emptyResultsDescription}
                </span>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
