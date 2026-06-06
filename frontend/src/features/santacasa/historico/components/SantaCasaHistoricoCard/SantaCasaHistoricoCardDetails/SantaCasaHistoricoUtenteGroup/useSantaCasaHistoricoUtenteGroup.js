// src/features/santacasa/historico/components/SantaCasaHistoricoCard/useSantaCasaHistoricoUtenteGroup.js

import { useState } from "react";

import {
  getHistoricoUtenteGroupViewModel,
  getInitialHistoricoUtenteVisibleCount,
  getNextHistoricoUtenteVisibleCount,
  HISTORICO_UTENTE_ITEMS_STEP,
} from "./santaCasaHistoricoUtenteGroup.utils";

export function useSantaCasaHistoricoUtenteGroup(
  group,
  { isSearchActive = false } = {},
) {
  const [visibleCount, setVisibleCount] = useState(HISTORICO_UTENTE_ITEMS_STEP);

  const viewModel = getHistoricoUtenteGroupViewModel({
    group,
    visibleCount,
    isSearchActive,
  });

  function handleShowMore() {
    setVisibleCount((currentVisibleCount) => {
      return getNextHistoricoUtenteVisibleCount({
        currentVisibleCount,
        totalItems: viewModel.totalItems,
      });
    });
  }

  function handleShowAll() {
    setVisibleCount(viewModel.totalItems);
  }

  function handleHideAll() {
    setVisibleCount(0);
  }

  function handleShowInitial() {
    setVisibleCount(
      getInitialHistoricoUtenteVisibleCount(viewModel.totalItems),
    );
  }

  return {
    visibleItems: viewModel.visibleItems,

    shouldShowActions: viewModel.shouldShowActions,
    canShowInitial: viewModel.canShowInitial,
    canShowMore: viewModel.canShowMore,
    canHideAll: viewModel.canHideAll,

    showingItemsLabel: viewModel.showingItemsLabel,
    showMoreLabel: viewModel.showMoreLabel,
    showInitialLabel: viewModel.showInitialLabel,

    handleShowInitial,
    handleShowMore,
    handleShowAll,
    handleHideAll,
  };
}
