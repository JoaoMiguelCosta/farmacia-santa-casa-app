// src/features/santacasa/pedidos/components/PedidoPendingList/usePedidoPendingCard.js
import { useState } from "react";

import { formatDateTime } from "../../../../../shared/utils/formatDate";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import {
  getMedicamentosCountLabel,
  getPedidoMedicamentosCount,
  getPedidoNumberLabel,
  getPedidoTotalQuantity,
  getPedidoUtentesCount,
  getUnidadesCountLabel,
  getUtentesCountLabel,
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
  const totalQuantity = getPedidoTotalQuantity(pedido);

  const detailsId = getSafeDetailsId(pedido);
  const pedidoNumberLabel = getPedidoNumberLabel(pedido);
  const createdAtLabel = formatDateTime(pedido?.createdAt);

  const utentesCountLabel = getUtentesCountLabel(utentesCount);
  const medicamentosCountLabel = getMedicamentosCountLabel(medicamentosCount);
  const totalQuantityLabel = getUnidadesCountLabel(totalQuantity);

  const toggleLabel = isDetailsOpen
    ? PEDIDOS_PAGE.actions.hideMedicamentos
    : PEDIDOS_PAGE.actions.viewMedicamentos;

  function handleToggleDetails() {
    setIsDetailsOpen((currentValue) => !currentValue);
  }

  return {
    detailsId,

    isDetailsOpen,

    pedidoNumberLabel,
    createdAtLabel,
    utentesCountLabel,
    medicamentosCountLabel,
    totalQuantityLabel,
    toggleLabel,

    handleToggleDetails,
  };
}
