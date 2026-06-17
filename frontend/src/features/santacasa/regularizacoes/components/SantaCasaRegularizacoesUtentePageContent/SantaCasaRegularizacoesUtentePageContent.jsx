import { Link } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";
import Button from "../../../../../shared/ui/Button/Button";

import SantaCasaRegularizacaoCard from "../SantaCasaRegularizacaoCard/SantaCasaRegularizacaoCard";
import SantaCasaRegularizacoesState from "../SantaCasaRegularizacoesList/SantaCasaRegularizacoesState";
import SantaCasaRegularizacoesUtenteSummary from "../SantaCasaRegularizacoesUtenteSummary/SantaCasaRegularizacoesUtenteSummary";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";
import { useSantaCasaRegularizacoesUtente } from "../../hooks/useSantaCasaRegularizacoesUtente";
import { useSantaCasaRegularizacoesUtenteFilters } from "../../hooks/useSantaCasaRegularizacoesUtenteFilters";
import {
  DETAILS_STATUS_OPTIONS,
  getUtenteTitle,
} from "../../utils/santaCasaRegularizacoesUtente.utils";

import styles from "./SantaCasaRegularizacoesUtentePageContent.module.css";

export default function SantaCasaRegularizacoesUtentePageContent() {
  const {
    group,
    hasRegularizacoes,
    isLoading,
    isRefreshing,
    error,
    refreshRegularizacoes,
  } = useSantaCasaRegularizacoesUtente();

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
  } = useSantaCasaRegularizacoesUtenteFilters({ medicamentos });

  const title = getUtenteTitle(group);

  return (
    <section
      className={styles.page}
      aria-labelledby="santacasa-regularizacoes-utente-title"
    >
      <Link to="/santacasa/regularizacoes" className={styles.backLink}>
        {SANTACASA_REGULARIZACOES_PAGE.details.backLabel}
      </Link>

      <PageHeader
        titleId="santacasa-regularizacoes-utente-title"
        eyebrow={SANTACASA_REGULARIZACOES_PAGE.details.eyebrow}
        title={title}
        description={SANTACASA_REGULARIZACOES_PAGE.details.description}
      />

      {isLoading ? (
        <SantaCasaRegularizacoesState
          title={SANTACASA_REGULARIZACOES_PAGE.details.loadingTitle}
          description={SANTACASA_REGULARIZACOES_PAGE.details.loadingDescription}
        />
      ) : error ? (
        <SantaCasaRegularizacoesState
          title={SANTACASA_REGULARIZACOES_PAGE.details.errorTitle}
          description={error}
          actionLabel={SANTACASA_REGULARIZACOES_PAGE.actions.refresh}
          onAction={refreshRegularizacoes}
        />
      ) : !hasRegularizacoes || !group ? (
        <SantaCasaRegularizacoesState
          title={SANTACASA_REGULARIZACOES_PAGE.details.emptyTitle}
          description={SANTACASA_REGULARIZACOES_PAGE.details.emptyDescription}
        />
      ) : (
        <>
          <SantaCasaRegularizacoesUtenteSummary group={group} />

          <section className={styles.medicamentos}>
            <header className={styles.sectionHeader}>
              <div className={styles.heading}>
                <h2 className={styles.sectionTitle}>
                  {SANTACASA_REGULARIZACOES_PAGE.details.medicinesTitle}
                </h2>

                <p className={styles.sectionDescription}>
                  {SANTACASA_REGULARIZACOES_PAGE.details.medicinesDescription}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={isRefreshing}
                onClick={refreshRegularizacoes}
              >
                {isRefreshing
                  ? SANTACASA_REGULARIZACOES_PAGE.actions.refreshing
                  : SANTACASA_REGULARIZACOES_PAGE.actions.refresh}
              </Button>
            </header>

            <div
              className={styles.controls}
              aria-label={SANTACASA_REGULARIZACOES_PAGE.details.controlsAriaLabel}
            >
              <label className={styles.controlField}>
                <span>{SANTACASA_REGULARIZACOES_PAGE.details.searchLabel}</span>

                <input
                  type="search"
                  value={medicamentoSearch}
                  placeholder={SANTACASA_REGULARIZACOES_PAGE.details.searchPlaceholder}
                  onChange={(event) => updateMedicamentoSearch(event.target.value)}
                />
              </label>

              <label className={styles.controlField}>
                <span>{SANTACASA_REGULARIZACOES_PAGE.details.statusLabel}</span>

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
                {SANTACASA_REGULARIZACOES_PAGE.actions.clearDetailsFilters}
              </button>

              <p className={styles.resultsMeta}>{medicinesResultsLabel}</p>
            </div>

            {hasVisibleMedicamentos ? (
              <>
                <div className={styles.cards}>
                  {displayedMedicamentos.map((regularizacao) => (
                    <SantaCasaRegularizacaoCard
                      key={regularizacao.id}
                      regularizacao={regularizacao}
                      variant="pending"
                      isGrouped
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
                          {SANTACASA_REGULARIZACOES_PAGE.actions.viewAllMedicamentos}
                        </button>
                      </>
                    ) : null}

                    {canShowLess ? (
                      <button
                        type="button"
                        className={styles.listButton}
                        onClick={showLessMedicamentos}
                      >
                        {SANTACASA_REGULARIZACOES_PAGE.actions.showLessMedicamentos}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyResults}>
                <strong>
                  {SANTACASA_REGULARIZACOES_PAGE.details.emptyResultsTitle}
                </strong>

                <span>
                  {SANTACASA_REGULARIZACOES_PAGE.details.emptyResultsDescription}
                </span>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
