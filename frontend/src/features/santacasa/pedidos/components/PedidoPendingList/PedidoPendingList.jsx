// src/features/santacasa/pedidos/components/PedidoPendingList/PedidoPendingList.jsx
import Button from "../../../../../shared/ui/Button/Button";
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import PedidoPendingCard from "./PedidoPendingCard";

import { getPaginationLabel } from "./pedidoPendingList.utils";

import styles from "./PedidoPendingList.module.css";

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
  isCanceling = false,
  error = null,
  onSearchChange,
  onApplyFilters,
  onClearFilters,
  onRefresh,
  onPreviousPage,
  onNextPage,
  onCancelRequest,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onApplyFilters?.();
  }

  const paginationLabel = getPaginationLabel({
    meta,
    currentPage,
    totalPages,
  });

  return (
    <SurfaceCard
      title={PEDIDOS_PAGE.sections.pending.title}
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
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </label>

        <div className={styles.filterActions}>
          <Button type="submit" size="sm">
            {PEDIDOS_PAGE.filters.submit}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClearFilters}
          >
            {PEDIDOS_PAGE.filters.clear}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isRefreshing}
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
        />
      ) : error ? (
        <DataState
          type="error"
          title={PEDIDOS_PAGE.sections.pending.errorTitle}
          description={error}
        />
      ) : pedidos.length === 0 ? (
        <DataState
          type="empty"
          title={PEDIDOS_PAGE.sections.pending.emptyTitle}
          description={PEDIDOS_PAGE.sections.pending.emptyDescription}
        />
      ) : (
        <>
          <div className={styles.list}>
            {pedidos.map((pedido) => (
              <PedidoPendingCard
                key={pedido.id}
                pedido={pedido}
                isCanceling={isCanceling}
                onCancelRequest={onCancelRequest}
              />
            ))}
          </div>

          <footer className={styles.pagination}>
            <p>{paginationLabel}</p>

            <div className={styles.paginationActions}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!hasPreviousPage}
                onClick={onPreviousPage}
              >
                {PEDIDOS_PAGE.actions.previous}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!hasNextPage}
                onClick={onNextPage}
              >
                {PEDIDOS_PAGE.actions.next}
              </Button>
            </div>
          </footer>
        </>
      )}
    </SurfaceCard>
  );
}
