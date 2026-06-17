// src/features/santacasa/shared/pedidos/components/SantaCasaPedidoDetails/useSantaCasaPedidoDetails.js

import { useMemo } from "react";

import { getSantaCasaPedidoDetailsViewModel } from "./santaCasaPedidoDetails.utils";

export function useSantaCasaPedidoDetails(pedido) {
  const viewModel = useMemo(() => {
    return getSantaCasaPedidoDetailsViewModel(pedido);
  }, [pedido]);

  return {
    hasGroups: viewModel.hasGroups,
    groups: viewModel.groups,
  };
}
