import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import PageHeader from "../../../../../shared/ui/PageHeader/PageHeader";

import FarmaciaRegularizacaoCard from "../FarmaciaRegularizacaoCard/FarmaciaRegularizacaoCard";
import FarmaciaRegularizacoesState from "../FarmaciaRegularizacoesState/FarmaciaRegularizacoesState";

import { FARMACIA_REGULARIZACOES_PAGE } from "../../config/farmaciaRegularizacoesPage.config";
import { useFarmaciaRegularizacoesUtente } from "../../hooks/useFarmaciaRegularizacoesUtente";

import styles from "./FarmaciaRegularizacoesUtentePageContent.module.css";

const UNKNOWN_LABEL = "—";
const STATUS_FILTER_ALL = "all";

const INITIAL_VISIBLE_MEDICAMENTOS = 5;
const VISIBLE_MEDICAMENTOS_INCREMENT = 5;

const DETAILS_STATUS_OPTIONS = [
  {
    value: STATUS_FILTER_ALL,
    label: FARMACIA_REGULARIZACOES_PAGE.details.statusAll,
  },
  {
    value: "PARCIALMENTE_REGULARIZADO",
    label: FARMACIA_REGULARIZACOES_PAGE.status.PARCIALMENTE_REGULARIZADO,
  },
  {
    value: "PENDENTE",
    label: FARMACIA_REGULARIZACOES_PAGE.status.PENDENTE,
  },
];

function normalizeSearchText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function getUtenteTitle(group) {
  return (
    group?.utente?.nome || FARMACIA_REGULARIZACOES_PAGE.details.titleFallback
  );
}

function getUtenteNumber(group) {
  return group?.utente?.numero9 || UNKNOWN_LABEL;
}

function getPedidosLabel(pedidoNumbers = []) {
  if (pedidoNumbers.length === 0) return UNKNOWN_LABEL;

  return pedidoNumbers.map((numero) => `#${numero}`).join(", ");
}

function getRegularizacaoPedidoSearchText(regularizacao) {
  const pedidoNumbers = Array.isArray(regularizacao?.pedidoNumbers)
    ? regularizacao.pedidoNumbers
    : [];

  const originPedidoNumbers = Array.isArray(regularizacao?.origemRegularizacoes)
    ? regularizacao.origemRegularizacoes.map((origin) => {
        return origin?.pedidoNumero ?? origin?.pedido?.numero ?? "";
      })
    : [];

  return [...pedidoNumbers, ...originPedidoNumbers]
    .filter(Boolean)
    .map((numero) => `#${numero} ${numero}`)
    .join(" ");
}

function getRegularizacaoSearchText(regularizacao) {
  return normalizeSearchText(
    [
      regularizacao?.medicamento,
      regularizacao?.medicamentoNorm,
      regularizacao?.status,
      FARMACIA_REGULARIZACOES_PAGE.status[regularizacao?.status],
      getRegularizacaoPedidoSearchText(regularizacao),
    ].join(" "),
  );
}

function filterMedicamentos({ medicamentos, search, status }) {
  const normalizedSearch = normalizeSearchText(search);

  return medicamentos.filter((regularizacao) => {
    if (status !== STATUS_FILTER_ALL && regularizacao?.status !== status) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return getRegularizacaoSearchText(regularizacao).includes(normalizedSearch);
  });
}

function FarmaciaRegularizacoesUtenteSummary({ group }) {
  if (!group) return null;

  return (
    <section
      className={styles.summary}
      aria-label={FARMACIA_REGULARIZACOES_PAGE.details.summaryAriaLabel}
    >
      <div className={styles.summaryFocus}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.unidadesRestantes}</span>
        <strong>{group.totalRestante}</strong>
      </div>

      <dl className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.utenteNumber}</dt>
          <dd>{getUtenteNumber(group)}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>
            {FARMACIA_REGULARIZACOES_PAGE.labels.medicamentosPorRegularizar}
          </dt>
          <dd>{group.totalMedicamentos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidosEnvolvidos}</dt>
          <dd>{group.totalPedidos}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.parciais}</dt>
          <dd>{group.totalParciais}</dd>
        </div>

        <div className={styles.summaryItem}>
          <dt>{FARMACIA_REGULARIZACOES_PAGE.labels.pendentes}</dt>
          <dd>{group.totalPendentes}</dd>
        </div>
      </dl>

      <div className={styles.pedidos}>
        <span>{FARMACIA_REGULARIZACOES_PAGE.labels.pedidos}</span>
        <strong>{getPedidosLabel(group.pedidoNumbers)}</strong>
      </div>
    </section>
  );
}

export default function FarmaciaRegularizacoesUtentePageContent() {
  const [medicamentoSearch, setMedicamentoSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_ALL);
  const [visibleCount, setVisibleCount] = useState(
    INITIAL_VISIBLE_MEDICAMENTOS,
  );

  const {
    group,

    hasRegularizacoes,

    isLoading,
    isRefreshing,
    error,

    refreshRegularizacoes,
  } = useFarmaciaRegularizacoesUtente();

  const medicamentos = useMemo(() => {
    return group?.medicamentos || [];
  }, [group?.medicamentos]);

  const visibleMedicamentos = useMemo(() => {
    return filterMedicamentos({
      medicamentos,
      search: medicamentoSearch,
      status: statusFilter,
    });
  }, [medicamentos, medicamentoSearch, statusFilter]);

  const displayedMedicamentos = useMemo(() => {
    return visibleMedicamentos.slice(0, visibleCount);
  }, [visibleMedicamentos, visibleCount]);

  const hiddenMedicamentosCount = Math.max(
    0,
    visibleMedicamentos.length - displayedMedicamentos.length,
  );

  const nextVisibleMedicamentosCount = Math.min(
    VISIBLE_MEDICAMENTOS_INCREMENT,
    hiddenMedicamentosCount,
  );

  const hasVisibleMedicamentos = displayedMedicamentos.length > 0;

  const hasActiveFilters =
    Boolean(medicamentoSearch.trim()) || statusFilter !== STATUS_FILTER_ALL;

  const canShowMore = hiddenMedicamentosCount > 0;

  const canShowLess =
    visibleCount > INITIAL_VISIBLE_MEDICAMENTOS &&
    visibleMedicamentos.length > INITIAL_VISIBLE_MEDICAMENTOS;

  const title = getUtenteTitle(group);

  const medicinesResultsLabel =
    FARMACIA_REGULARIZACOES_PAGE.details.getMedicinesResultsLabel({
      visible: displayedMedicamentos.length,
      filtered: visibleMedicamentos.length,
      total: medicamentos.length,
    });

  const viewMoreMedicinesLabel =
    FARMACIA_REGULARIZACOES_PAGE.details.getViewMoreMedicinesLabel({
      count: nextVisibleMedicamentosCount,
    });

  const hiddenMedicinesLabel =
    FARMACIA_REGULARIZACOES_PAGE.details.getHiddenMedicinesLabel({
      hidden: hiddenMedicamentosCount,
    });

  function updateMedicamentoSearch(value) {
    setMedicamentoSearch(value);
    setVisibleCount(INITIAL_VISIBLE_MEDICAMENTOS);
  }

  function updateStatusFilter(value) {
    setStatusFilter(value);
    setVisibleCount(INITIAL_VISIBLE_MEDICAMENTOS);
  }

  function clearDetailsFilters() {
    setMedicamentoSearch("");
    setStatusFilter(STATUS_FILTER_ALL);
    setVisibleCount(INITIAL_VISIBLE_MEDICAMENTOS);
  }

  function showMoreMedicamentos() {
    setVisibleCount((currentVisibleCount) => {
      return Math.min(
        currentVisibleCount + VISIBLE_MEDICAMENTOS_INCREMENT,
        visibleMedicamentos.length,
      );
    });
  }

  function showAllMedicamentos() {
    setVisibleCount(visibleMedicamentos.length);
  }

  function showLessMedicamentos() {
    setVisibleCount(INITIAL_VISIBLE_MEDICAMENTOS);
  }

  return (
    <section
      className={styles.page}
      aria-labelledby="farmacia-regularizacoes-utente-title"
    >
      <Link to="/farmacia/regularizacoes" className={styles.backLink}>
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

              <button
                type="button"
                className={styles.refreshButton}
                disabled={isRefreshing}
                onClick={refreshRegularizacoes}
              >
                {isRefreshing
                  ? FARMACIA_REGULARIZACOES_PAGE.actions.refreshing
                  : FARMACIA_REGULARIZACOES_PAGE.actions.refresh}
              </button>
            </header>

            <div
              className={styles.controls}
              aria-label={
                FARMACIA_REGULARIZACOES_PAGE.details.controlsAriaLabel
              }
            >
              <label className={styles.controlField}>
                <span>{FARMACIA_REGULARIZACOES_PAGE.details.searchLabel}</span>

                <input
                  type="search"
                  value={medicamentoSearch}
                  placeholder={
                    FARMACIA_REGULARIZACOES_PAGE.details.searchPlaceholder
                  }
                  onChange={(event) =>
                    updateMedicamentoSearch(event.target.value)
                  }
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
                          {
                            FARMACIA_REGULARIZACOES_PAGE.actions
                              .viewAllMedicamentos
                          }
                        </button>
                      </>
                    ) : null}

                    {canShowLess ? (
                      <button
                        type="button"
                        className={styles.listButton}
                        onClick={showLessMedicamentos}
                      >
                        {
                          FARMACIA_REGULARIZACOES_PAGE.actions
                            .showLessMedicamentos
                        }
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
