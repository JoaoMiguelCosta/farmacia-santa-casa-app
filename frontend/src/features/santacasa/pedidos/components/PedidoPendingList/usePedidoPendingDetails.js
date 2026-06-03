// src/features/santacasa/pedidos/components/PedidoPendingList/usePedidoPendingDetails.js
import { useState } from "react";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import {
  getLimitedPedidoGroups,
  getMedicamentosCountLabel,
  getNextVisibleMedicamentosCount,
  getRemainingMedicamentosCount,
  getUnidadesCountLabel,
  getViewMoreMedicamentosLabel,
  getVisibleMedicamentosLabel,
  groupPedidoItemsByUtente,
} from "./pedidoPendingList.utils";

function getGroupsMedicamentosTotal(groups = []) {
  return groups.reduce((total, group) => total + group.items.length, 0);
}

function getGroupsQuantidadeTotal(groups = []) {
  return groups.reduce((total, group) => {
    const groupTotal = group.items.reduce((subtotal, item) => {
      return subtotal + (Number(item?.quantidade) || 0);
    }, 0);

    return total + groupTotal;
  }, 0);
}

export function usePedidoPendingDetails(pedido) {
  const visibleStep = PEDIDOS_PAGE.sections.pending.detailsVisibleLimit;

  const [visibleLimit, setVisibleLimit] = useState(visibleStep);

  const groups = groupPedidoItemsByUtente(pedido?.itens);
  const visibleGroups = getLimitedPedidoGroups(groups, visibleLimit);

  const totalMedicamentos = getGroupsMedicamentosTotal(groups);
  const totalQuantidade = getGroupsQuantidadeTotal(groups);
  const visibleMedicamentos = getGroupsMedicamentosTotal(visibleGroups);

  const remainingMedicamentos = getRemainingMedicamentosCount({
    visible: visibleMedicamentos,
    total: totalMedicamentos,
    step: visibleStep,
  });

  const canShowMore = visibleMedicamentos < totalMedicamentos;
  const hasGroups = groups.length > 0;

  const totalResumoLabel = `${getMedicamentosCountLabel(
    totalMedicamentos,
  )} · ${getUnidadesCountLabel(totalQuantidade)}`;

  const visibleMedicamentosLabel = getVisibleMedicamentosLabel({
    visible: visibleMedicamentos,
    total: totalMedicamentos,
  });

  const viewMoreMedicamentosLabel = getViewMoreMedicamentosLabel(
    remainingMedicamentos,
  );

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
    hasGroups,
    canShowMore,

    visibleGroups,
    totalResumoLabel,
    visibleMedicamentosLabel,
    viewMoreMedicamentosLabel,

    handleShowMore,
    handleShowAll,
  };
}
