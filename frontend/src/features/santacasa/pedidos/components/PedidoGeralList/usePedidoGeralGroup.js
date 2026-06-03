// src/features/santacasa/pedidos/components/PedidoGeralList/usePedidoGeralGroup.js
import { useState } from "react";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import {
  getItemsQuantityTotal,
  getLimitedPedidoItems,
  getMedicamentosCountLabel,
  getNextVisibleMedicamentosCount,
  getRemainingMedicamentosCount,
  getSafeDetailsId,
  getUnidadesCountLabel,
  getViewMoreMedicamentosLabel,
  getVisibleMedicamentosLabel,
} from "./pedidoGeralList.utils";

export function usePedidoGeralGroup({ group, defaultOpen = false }) {
  const visibleStep = PEDIDOS_PAGE.sections.draft.detailsVisibleLimit;
  const detailsId = getSafeDetailsId("pedido-geral-utente", group.utenteId);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [visibleLimit, setVisibleLimit] = useState(visibleStep);

  const totalMedicamentos = group.items.length;
  const totalQuantidade = getItemsQuantityTotal(group.items);

  const visibleItems = getLimitedPedidoItems(group.items, visibleLimit);
  const visibleMedicamentos = visibleItems.length;

  const remainingMedicamentos = getRemainingMedicamentosCount({
    visible: visibleMedicamentos,
    total: totalMedicamentos,
    step: visibleStep,
  });

  const canShowMore = visibleMedicamentos < totalMedicamentos;

  const toggleLabel = isOpen
    ? PEDIDOS_PAGE.actions.hideMedicamentos
    : PEDIDOS_PAGE.actions.viewMedicamentos;

  const visibleMedicamentosLabel = getVisibleMedicamentosLabel({
    visible: visibleMedicamentos,
    total: totalMedicamentos,
  });

  const viewMoreMedicamentosLabel = getViewMoreMedicamentosLabel(
    remainingMedicamentos,
  );

  const totalMedicamentosLabel = getMedicamentosCountLabel(totalMedicamentos);
  const totalQuantidadeLabel = getUnidadesCountLabel(totalQuantidade);

  function handleToggleOpen() {
    setIsOpen((currentValue) => !currentValue);
  }

  function handleShowMore() {
    setVisibleLimit((currentVisibleLimit) =>
      getNextVisibleMedicamentosCount({
        currentVisible: currentVisibleLimit,
        total: totalMedicamentos,
        step: visibleStep,
      }),
    );
  }

  function handleShowAll() {
    setVisibleLimit(totalMedicamentos);
  }

  return {
    detailsId,

    isOpen,
    canShowMore,

    visibleItems,
    visibleMedicamentosLabel,
    viewMoreMedicamentosLabel,

    totalMedicamentosLabel,
    totalQuantidadeLabel,
    toggleLabel,

    handleToggleOpen,
    handleShowMore,
    handleShowAll,
  };
}
