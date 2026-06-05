// src/features/santacasa/pedidos/components/PedidoPendingList/usePedidoPendingCard.js
import { useState } from "react";

import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import {
  getExpiredMedicamentosCountLabel,
  getMedicamentosCountLabel,
  getPedidoExpirationWarningsCount,
  getPedidoMedicamentosCount,
  getPedidoNumberLabel,
  getPedidoPendingMedicamentosCount,
  getPedidoPendingQuantity,
  getPedidoStatusLabel,
  getPedidoTotalQuantity,
  getPedidoUtentesCount,
  getUnidadesCountLabel,
  getUtentesCountLabel,
  hasPedidoExpirationWarnings,
} from "./pedidoPendingList.utils";

function getSafeDetailsId(pedido) {
  const safePedidoId = String(pedido?.id || pedido?.numero || "sem-id").replace(
    /[^a-zA-Z0-9_-]/g,
    "-",
  );

  return `pedido-${safePedidoId}-medicamentos`;
}

export function usePedidoPendingCard(pedido) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const utentesCount = getPedidoUtentesCount(pedido);
  const medicamentosCount = getPedidoMedicamentosCount(pedido);
  const pendingMedicamentosCount = getPedidoPendingMedicamentosCount(pedido);
  const totalQuantity = getPedidoTotalQuantity(pedido);
  const pendingQuantity = getPedidoPendingQuantity(pedido);

  const detailsId = getSafeDetailsId(pedido);
  const pedidoNumberLabel = getPedidoNumberLabel(pedido);
  const pedidoStatusLabel = getPedidoStatusLabel(pedido);
  const createdAtLabel = formatDateTime(pedido?.createdAt);

  const hasExpirationWarning = hasPedidoExpirationWarnings(pedido);
  const expirationWarningsCount = getPedidoExpirationWarningsCount(pedido);

  const utentesCountLabel = getUtentesCountLabel(utentesCount);
  const medicamentosCountLabel = getMedicamentosCountLabel(medicamentosCount);
  const pendingMedicamentosCountLabel = getMedicamentosCountLabel(
    pendingMedicamentosCount,
  );
  const canceledMedicamentosCountLabel = getMedicamentosCountLabel(
    expirationWarningsCount,
  );
  const totalQuantityLabel = getUnidadesCountLabel(totalQuantity);
  const pendingQuantityLabel = getUnidadesCountLabel(pendingQuantity);
  const expirationWarningsLabel = getExpiredMedicamentosCountLabel(
    expirationWarningsCount,
  );

  const toggleLabel = isDetailsOpen
    ? PEDIDOS_PAGE.actions.hideMedicamentos
    : PEDIDOS_PAGE.actions.viewMedicamentos;

  function handleToggleDetails() {
    setIsDetailsOpen((currentValue) => !currentValue);
  }

  return {
    detailsId,

    isDetailsOpen,
    hasExpirationWarning,

    pedidoNumberLabel,
    pedidoStatusLabel,
    createdAtLabel,
    utentesCountLabel,
    medicamentosCountLabel,
    pendingMedicamentosCountLabel,
    canceledMedicamentosCountLabel,
    totalQuantityLabel,
    pendingQuantityLabel,
    expirationWarningsLabel,
    toggleLabel,

    handleToggleDetails,
  };
}
