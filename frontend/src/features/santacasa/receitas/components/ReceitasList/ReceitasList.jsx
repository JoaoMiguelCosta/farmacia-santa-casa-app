// src/features/santacasa/receitas/components/ReceitasList/ReceitasList.jsx
import { useState } from "react";

import DataState from "../../../../../shared/ui/DataState/DataState";
import SurfaceCard from "../../../../../shared/ui/SurfaceCard/SurfaceCard";

import { RECEITAS_PAGE } from "../../config/receitasPage.config";

import ReceitaRow from "./ReceitaRow";

import styles from "./ReceitasList.module.css";

export default function ReceitasList({
  receitas = [],
  selectedUtenteId = "",
  isLoading = false,
  error = null,
  deletingLinhaId = null,
  pedidoQuantities = {},
  pedidoItemsQuantities = {},
  onPedidoQuantityChange,
  onAddToPedido,
  onRetry,
  onBlockedDelete,
  onDelete,
}) {
  const [expandedLinhaId, setExpandedLinhaId] = useState(null);

  const hasPedidoActions = typeof onAddToPedido === "function";
  const hasDeleteActions = typeof onDelete === "function";

  function handleToggleCodes(linhaId) {
    setExpandedLinhaId((currentLinhaId) =>
      currentLinhaId === linhaId ? null : linhaId,
    );
  }

  if (!selectedUtenteId) {
    return (
      <DataState
        type="empty"
        title={RECEITAS_PAGE.list.noUtenteTitle}
        description={RECEITAS_PAGE.list.noUtenteDescription}
      />
    );
  }

  if (isLoading) {
    return (
      <DataState
        type="loading"
        title={RECEITAS_PAGE.list.loadingTitle}
        description={RECEITAS_PAGE.list.loadingDescription}
      />
    );
  }

  if (error) {
    return (
      <DataState
        type="error"
        title={RECEITAS_PAGE.list.errorTitle}
        description={error}
        actionLabel={RECEITAS_PAGE.list.retryLabel}
        onAction={onRetry}
      />
    );
  }

  if (receitas.length === 0) {
    return (
      <DataState
        type="empty"
        title={RECEITAS_PAGE.list.emptyTitle}
        description={RECEITAS_PAGE.list.emptyDescription}
      />
    );
  }

  return (
    <SurfaceCard
      title={RECEITAS_PAGE.list.title}
      description={RECEITAS_PAGE.list.description}
      tone="strong"
    >
      <div className={styles.list} role="list">
        {receitas.map((linha) => (
          <ReceitaRow
            key={linha.linhaId}
            linha={linha}
            receitas={receitas}
            deletingLinhaId={deletingLinhaId}
            pedidoQuantities={pedidoQuantities}
            pedidoItemsQuantities={pedidoItemsQuantities}
            expandedLinhaId={expandedLinhaId}
            hasPedidoActions={hasPedidoActions}
            hasDeleteActions={hasDeleteActions}
            onToggleCodes={handleToggleCodes}
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
