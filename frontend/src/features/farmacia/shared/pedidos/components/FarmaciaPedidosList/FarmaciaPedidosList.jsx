// src/features/farmacia/shared/pedidos/components/FarmaciaPedidosList/FarmaciaPedidosList.jsx
import { useLocation } from "react-router-dom";

import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";

import FarmaciaPedidoCard from "../FarmaciaPedidoCard/FarmaciaPedidoCard";

import styles from "./FarmaciaPedidosList.module.css";

function FarmaciaPedidosState({ title, description, actionLabel, onAction }) {
  return (
    <div className={styles.state}>
      <strong className={styles.stateTitle}>{title}</strong>

      {description ? (
        <p className={styles.stateDescription}>{description}</p>
      ) : null}

      {actionLabel && onAction ? (
        <button type="button" className={styles.stateAction} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function FarmaciaPedidosSearch({
  config,
  searchValue,
  isDisabled = false,
  onSearch,
  onClear,
}) {
  if (!config || !onSearch) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSearch(formData.get("search"));
  }

  const hasActiveSearch = Boolean(String(searchValue || "").trim());

  return (
    <form
      className={styles.searchForm}
      aria-label={config.ariaLabel}
      onSubmit={handleSubmit}
    >
      <label className={styles.searchField}>
        <span>{config.label}</span>

        <input
          key={searchValue}
          type="search"
          name="search"
          defaultValue={searchValue}
          placeholder={config.placeholder}
          disabled={isDisabled}
        />
      </label>

      <div className={styles.searchActions}>
        {hasActiveSearch ? (
          <button
            type="button"
            className={styles.clearButton}
            disabled={isDisabled}
            onClick={onClear}
          >
            {config.clearLabel}
          </button>
        ) : null}

        <button
          type="submit"
          className={styles.searchButton}
          disabled={isDisabled}
        >
          {config.submitLabel}
        </button>
      </div>
    </form>
  );
}

function FarmaciaPedidosPagination({
  config,
  pagination,
  totalPedidos,
  isDisabled = false,
  onPreviousPage,
  onNextPage,
}) {
  if (!config || !pagination || totalPedidos <= 0) {
    return null;
  }

  const resultLabel =
    totalPedidos === 1 ? config.resultSingular : config.resultPlural;

  return (
    <footer className={styles.pagination}>
      <div className={styles.paginationInfo}>
        <span>
          {config.resultsPrefix}{" "}
          <strong>
            {pagination.rangeStart}–{pagination.rangeEnd}
          </strong>{" "}
          {config.resultsSeparator} <strong>{totalPedidos}</strong>{" "}
          {resultLabel}
        </span>

        <span>
          {config.pageLabel} <strong>{pagination.currentPage}</strong>{" "}
          {config.pageSeparator} <strong>{pagination.totalPages}</strong>
        </span>
      </div>

      <div className={styles.paginationActions}>
        <button
          type="button"
          disabled={isDisabled || !pagination.hasPreviousPage}
          onClick={onPreviousPage}
        >
          {config.previousLabel}
        </button>

        <button
          type="button"
          disabled={isDisabled || !pagination.hasNextPage}
          onClick={onNextPage}
        >
          {config.nextLabel}
        </button>
      </div>
    </footer>
  );
}

function getDefaultSectionConfig(variant) {
  if (variant === "history") {
    return FARMACIA_PEDIDO_UI.sections.history;
  }

  return FARMACIA_PEDIDO_UI.sections.list;
}

function getSafeTotalPedidos(totalPedidos, pedidos) {
  const parsedTotal = Number(totalPedidos);

  if (Number.isFinite(parsedTotal) && parsedTotal >= 0) {
    return parsedTotal;
  }

  return pedidos.length;
}

function getPedidosCountLabel(sectionConfig, totalPedidos) {
  if (totalPedidos === 1) {
    return sectionConfig.countSingular;
  }

  return sectionConfig.countPlural;
}

function getPedidoDetailsConfig({ pedidoId, variant, currentLocation }) {
  if (variant === "history") {
    return {
      detailsTo: `/farmacia/historico/${pedidoId}`,

      detailsLabel: FARMACIA_PEDIDO_UI.actions.consultPedido,

      detailsNavigationState: {
        from: currentLocation,
      },
    };
  }

  return {
    detailsTo: `/farmacia/pedidos/${pedidoId}`,

    detailsLabel: FARMACIA_PEDIDO_UI.actions.openPedido,

    detailsNavigationState: null,
  };
}

export default function FarmaciaPedidosList({
  pedidos = [],
  totalPedidos = null,

  searchValue = "",
  pagination = null,

  variant = "pending",
  sectionConfig: customSectionConfig = null,

  isLoading = false,
  isRefreshing = false,
  isQuerying = false,

  error = null,

  onRefresh,
  onSearch,
  onClearSearch,
  onPreviousPage,
  onNextPage,
}) {
  const location = useLocation();

  const sectionConfig = customSectionConfig || getDefaultSectionConfig(variant);

  const hasPedidos = pedidos.length > 0;
  const isPendingVariant = variant === "pending";

  const hasActiveSearch = Boolean(String(searchValue || "").trim());

  const isControlsDisabled = isRefreshing || isQuerying;

  const safeTotalPedidos = getSafeTotalPedidos(totalPedidos, pedidos);

  const hasCountConfig = Boolean(
    sectionConfig.countSingular && sectionConfig.countPlural,
  );

  const countLabel = hasCountConfig
    ? getPedidosCountLabel(sectionConfig, safeTotalPedidos)
    : null;

  const headerClassName = [
    styles.header,
    isPendingVariant ? styles.pendingHeader : "",
  ]
    .filter(Boolean)
    .join(" ");

  const emptyTitle =
    hasActiveSearch && sectionConfig.search?.emptyTitle
      ? sectionConfig.search.emptyTitle
      : sectionConfig.emptyTitle;

  const emptyDescription =
    hasActiveSearch && sectionConfig.search?.emptyDescription
      ? sectionConfig.search.emptyDescription
      : sectionConfig.emptyDescription;

  const currentLocation = `${location.pathname}${location.search}${location.hash}`;

  if (isLoading) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaPedidosState
          title={sectionConfig.loadingTitle}
          description={sectionConfig.loadingDescription}
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section} aria-live="polite">
        <FarmaciaPedidosState
          title={sectionConfig.errorTitle}
          description={error}
          actionLabel={FARMACIA_PEDIDO_UI.actions.refresh}
          onAction={onRefresh}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-labelledby={`farmacia-pedidos-${variant}-title`}
      aria-busy={isRefreshing || isQuerying}
    >
      <header className={headerClassName}>
        <div className={styles.heading}>
          <h2 id={`farmacia-pedidos-${variant}-title`} className={styles.title}>
            {sectionConfig.title}
          </h2>

          <p className={styles.description}>{sectionConfig.description}</p>
        </div>

        <div className={styles.tools}>
          {hasCountConfig ? (
            <div className={styles.count} role="status" aria-live="polite">
              <strong>{safeTotalPedidos}</strong>

              <span>{countLabel}</span>
            </div>
          ) : null}

          <button
            type="button"
            className={styles.refreshButton}
            disabled={isControlsDisabled}
            onClick={onRefresh}
          >
            {isRefreshing
              ? FARMACIA_PEDIDO_UI.actions.refreshing
              : FARMACIA_PEDIDO_UI.actions.refresh}
          </button>
        </div>
      </header>

      {sectionConfig.search ? (
        <div className={styles.controls}>
          <FarmaciaPedidosSearch
            config={sectionConfig.search}
            searchValue={searchValue}
            isDisabled={isControlsDisabled}
            onSearch={onSearch}
            onClear={onClearSearch}
          />
        </div>
      ) : null}

      {isQuerying ? (
        <p className={styles.loadingStatus} role="status" aria-live="polite">
          {sectionConfig.updatingLabel}
        </p>
      ) : null}

      {!hasPedidos ? (
        <FarmaciaPedidosState
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          <div
            className={styles.list}
            data-loading={isQuerying ? "true" : "false"}
          >
            {pedidos.map((pedido) => {
              const detailsConfig = getPedidoDetailsConfig({
                pedidoId: pedido.id,
                variant,
                currentLocation,
              });

              return (
                <FarmaciaPedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  variant={variant}
                  detailsTo={detailsConfig.detailsTo}
                  detailsLabel={detailsConfig.detailsLabel}
                  detailsNavigationState={detailsConfig.detailsNavigationState}
                  showUtentes={false}
                />
              );
            })}
          </div>

          <FarmaciaPedidosPagination
            config={sectionConfig.pagination}
            pagination={pagination}
            totalPedidos={safeTotalPedidos}
            isDisabled={isControlsDisabled}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
          />
        </>
      )}
    </section>
  );
}
