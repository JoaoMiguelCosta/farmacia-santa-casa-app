// src/features/santacasa/sem-receita/components/SemReceitaList/SemReceitaList.jsx
import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { SEM_RECEITA_PAGE } from "../../config/semReceitaPage.config";

import SemReceitaRow from "./SemReceitaRow";

import styles from "./SemReceitaList.module.css";

export default function SemReceitaList({
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
        title={SEM_RECEITA_PAGE.list.noUtenteTitle}
        description={SEM_RECEITA_PAGE.list.noUtenteDescription}
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={SEM_RECEITA_PAGE.list.loadingTitle}
        description={SEM_RECEITA_PAGE.list.loadingDescription}
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={SEM_RECEITA_PAGE.list.errorTitle}
        description={error}
        actionLabel={SEM_RECEITA_PAGE.list.retryLabel}
        onAction={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <DataState
        type="empty"
        title={SEM_RECEITA_PAGE.list.emptyTitle}
        description={SEM_RECEITA_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={SEM_RECEITA_PAGE.list.title}
      description={SEM_RECEITA_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.list} role="list">
        {items.map((item) => (
          <SemReceitaRow
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
