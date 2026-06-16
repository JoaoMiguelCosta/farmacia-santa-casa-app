import { useLocation } from "react-router-dom";

import { FARMACIA_PEDIDO_UI } from "../../config/farmaciaPedidoUi.config";
import {
  getDefaultSectionConfig,
  getSafeTotalPedidos,
  getPedidosCountLabel,
  getPedidoDetailsConfig,
} from "../../utils/farmaciaPedidosList.utils";

import FarmaciaPedidoCard from "../FarmaciaPedidoCard/FarmaciaPedidoCard";
import FarmaciaPedidosState from "../FarmaciaPedidosState/FarmaciaPedidosState";
import FarmaciaPedidosSearch from "../FarmaciaPedidosSearch/FarmaciaPedidosSearch";
import FarmaciaPedidosPagination from "../FarmaciaPedidosPagination/FarmaciaPedidosPagination";

import Button from "../../../../../../shared/ui/Button/Button";

import styles from "./FarmaciaPedidosList.module.css";

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

          <Button
            variant="secondary"
            size="sm"
            disabled={isControlsDisabled}
            onClick={onRefresh}
          >
            {isRefreshing
              ? FARMACIA_PEDIDO_UI.actions.refreshing
              : FARMACIA_PEDIDO_UI.actions.refresh}
          </Button>
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
