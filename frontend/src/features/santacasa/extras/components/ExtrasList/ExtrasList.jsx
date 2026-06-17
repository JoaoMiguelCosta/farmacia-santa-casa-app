// src/features/santacasa/extras/components/ExtrasList/ExtrasList.jsx
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { EXTRAS_PAGE } from "../../config/extrasPage.config";

import ExtraRow from "./ExtraRow";

import styles from "./ExtrasList.module.css";

export default function ExtrasList({
  items = [],
  selectedUtenteId = "",
  isLoading = false,
  error = null,
  deletingItemId = null,
  pedidoQuantities = {},
  pedidoItemsQuantities = {},
  onPedidoQuantityChange,
  onAddToPedido,
  onRetry,
  onBlockedDelete,
  onDelete,
}) {
  const hasPedidoActions = typeof onAddToPedido === "function";
  const hasDeleteActions = typeof onDelete === "function";

  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title={EXTRAS_PAGE.list.noUtenteTitle}
        description={EXTRAS_PAGE.list.noUtenteDescription}
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={EXTRAS_PAGE.list.loadingTitle}
        description={EXTRAS_PAGE.list.loadingDescription}
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={EXTRAS_PAGE.list.errorTitle}
        description={error}
        actionLabel={EXTRAS_PAGE.list.retryLabel}
        onAction={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <DataState
        type="empty"
        title={EXTRAS_PAGE.list.emptyTitle}
        description={EXTRAS_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={EXTRAS_PAGE.list.title}
      description={EXTRAS_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.list} role="list">
        {items.map((item) => (
          <ExtraRow
            key={item.id}
            item={item}
            deletingItemId={deletingItemId}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            hasPedidoActions={hasPedidoActions}
            hasDeleteActions={hasDeleteActions}
            onPedidoQuantityChange={onPedidoQuantityChange}
            onAddToPedido={onAddToPedido}
            onBlockedDelete={onBlockedDelete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </SurfaceCard>
  );
}
