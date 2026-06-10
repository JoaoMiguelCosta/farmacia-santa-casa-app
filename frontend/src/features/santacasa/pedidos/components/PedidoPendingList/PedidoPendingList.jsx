// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingList.jsx

import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingCard from "./PedidoPendingCard";

import { getPaginationLabel } from "./pedidoPendingList.utils";

import styles from "./PedidoPendingList.module.css";

function getPendingPedidosTotal(meta, pedidos) {
  const total = Number(meta?.total);

  if (Number.isFinite(total) && total >= 0) {
    return total;
  }

  return Array.isArray(pedidos) ? pedidos.length : 0;
}

function getPendingCountAriaLabel(total) {
  return PEDIDOS_PAGE.sections.pending.countAriaLabel.replace("{count}", total);
}

export default function PedidoPendingList({
  pedidos = [],
  meta,

  searchInput = "",

  currentPage = 1,
  totalPages = 1,

  hasPreviousPage = false,
  hasNextPage = false,

  isLoading = false,
  isRefreshing = false,

  error = null,

  onSearchChange,
  onApplyFilters,
  onClearFilters,

  onRefresh,

  onPreviousPage,
  onNextPage,
}) {
  const isInteractionDisabled = isLoading || isRefreshing;

  const pendingPedidosTotal = getPendingPedidosTotal(meta, pedidos);

  const paginationLabel = getPaginationLabel({
    meta,
    currentPage,
    totalPages,
  });

  const sectionTitle = (
    <span className={styles.sectionTitleRow}>
      <span className={styles.sectionTitleText}>
        {PEDIDOS_PAGE.sections.pending.title}
      </span>

      <span
        className={styles.pendingCount}
        aria-label={getPendingCountAriaLabel(pendingPedidosTotal)}
        aria-live="polite"
      >
        {pendingPedidosTotal}
      </span>
    </span>
  );

  function handleSubmit(event) {
    event.preventDefault();
    onApplyFilters?.();
  }

  return (
    <SurfaceCard
      title={sectionTitle}
      description={PEDIDOS_PAGE.sections.pending.description}
      tone="strong"
    >
      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.filterField}>
          <span>{PEDIDOS_PAGE.filters.searchLabel}</span>

          <input
            type="search"
            value={searchInput}
            placeholder={PEDIDOS_PAGE.filters.searchPlaceholder}
            disabled={isInteractionDisabled}
            onChange={(event) => {
              onSearchChange?.(event.target.value);
            }}
          />
        </label>

        <div className={styles.filterActions}>
          <Button type="submit" size="sm" disabled={isInteractionDisabled}>
            {PEDIDOS_PAGE.filters.submit}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isInteractionDisabled}
            onClick={onClearFilters}
          >
            {PEDIDOS_PAGE.filters.clear}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            isLoading={isRefreshing}
            disabled={isLoading}
            onClick={onRefresh}
          >
            {isRefreshing
              ? PEDIDOS_PAGE.actions.refreshing
              : PEDIDOS_PAGE.actions.refresh}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <DataState
          type="loading"
          title={PEDIDOS_PAGE.sections.pending.loadingTitle}
          description={PEDIDOS_PAGE.sections.pending.loadingDescription}
        />
      ) : null}

      {!isLoading && error ? (
        <DataState
          type="error"
          title={PEDIDOS_PAGE.sections.pending.errorTitle}
          description={error}
          actionLabel={PEDIDOS_PAGE.sections.pending.retryLabel}
          onAction={onRefresh}
        />
      ) : null}

      {!isLoading && !error && pedidos.length === 0 ? (
        <DataState
          type="empty"
          title={PEDIDOS_PAGE.sections.pending.emptyTitle}
          description={PEDIDOS_PAGE.sections.pending.emptyDescription}
        />
      ) : null}

      {!isLoading && !error && pedidos.length > 0 ? (
        <div className={styles.list}>
          {pedidos.map((pedido) => (
            <PedidoPendingCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      ) : null}

      <section
        className={styles.pagination}
        aria-label={PEDIDOS_PAGE.sections.pending.paginationAriaLabel}
      >
        <p>{paginationLabel}</p>

        <div className={styles.paginationActions}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasPreviousPage || isLoading || isRefreshing}
            onClick={onPreviousPage}
          >
            {PEDIDOS_PAGE.actions.previous}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasNextPage || isLoading || isRefreshing}
            onClick={onNextPage}
          >
            {PEDIDOS_PAGE.actions.next}
          </Button>
        </div>
      </section>
    </SurfaceCard>
  );
}
