import { FARMACIA_PEDIDO_UI } from "../config/farmaciaPedidoUi.config";

export function getDefaultSectionConfig(variant) {
  if (variant === "history") {
    return FARMACIA_PEDIDO_UI.sections.history;
  }

  return FARMACIA_PEDIDO_UI.sections.list;
}

export function getSafeTotalPedidos(totalPedidos, pedidos) {
  const parsedTotal = Number(totalPedidos);

  if (Number.isFinite(parsedTotal) && parsedTotal >= 0) {
    return parsedTotal;
  }

  return pedidos.length;
}

export function getPedidosCountLabel(sectionConfig, totalPedidos) {
  if (totalPedidos === 1) {
    return sectionConfig.countSingular;
  }

  return sectionConfig.countPlural;
}

export function getPedidoDetailsConfig({ pedidoId, variant, currentLocation }) {
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
