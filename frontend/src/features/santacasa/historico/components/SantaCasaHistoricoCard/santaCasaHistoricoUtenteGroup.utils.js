// src/features/santacasa/historico/components/SantaCasaHistoricoCard/santaCasaHistoricoUtenteGroup.utils.js

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

export const HISTORICO_UTENTE_ITEMS_STEP = 5;

function getSafeItems(group) {
  if (!Array.isArray(group?.items)) {
    return [];
  }

  return group.items;
}

function getSafeVisibleCount({ visibleCount, totalItems, isSearchActive }) {
  if (isSearchActive) {
    return totalItems;
  }

  const normalizedVisibleCount = Number(visibleCount);

  if (!Number.isFinite(normalizedVisibleCount)) {
    return 0;
  }

  return Math.min(Math.max(0, normalizedVisibleCount), totalItems);
}

function getPluralLabel(value, singular, plural) {
  return Number(value) === 1 ? singular : plural;
}

function getMedicamentoLabel(value) {
  const labels = SANTACASA_HISTORICO_PAGE.labels;

  return getPluralLabel(
    value,
    labels.medicamentoSingular,
    labels.medicamentoPlural,
  );
}

function getShowingItemsLabel({ visibleCount, totalItems }) {
  const labels = SANTACASA_HISTORICO_PAGE.labels;

  if (visibleCount === 0) {
    return labels.hiddenItems;
  }

  return [
    labels.showingItems,
    visibleCount,
    labels.of,
    totalItems,
    `${getMedicamentoLabel(totalItems)}.`,
  ].join(" ");
}

function getShowMoreItemsLabel(count) {
  return [
    SANTACASA_HISTORICO_PAGE.actions.showMoreItems,
    count,
    getMedicamentoLabel(count),
  ].join(" ");
}

function getShowInitialItemsLabel(count) {
  return [
    SANTACASA_HISTORICO_PAGE.actions.showInitialItems,
    count,
    getMedicamentoLabel(count),
  ].join(" ");
}

export function getHistoricoUtenteGroupViewModel({
  group,
  visibleCount,
  isSearchActive = false,
}) {
  const items = getSafeItems(group);
  const totalItems = items.length;

  const safeVisibleCount = getSafeVisibleCount({
    visibleCount,
    totalItems,
    isSearchActive,
  });

  const remainingItems = Math.max(totalItems - safeVisibleCount, 0);

  const nextItemsCount = Math.min(HISTORICO_UTENTE_ITEMS_STEP, remainingItems);

  const initialItemsCount = Math.min(HISTORICO_UTENTE_ITEMS_STEP, totalItems);

  const canUsePagination =
    !isSearchActive && totalItems > HISTORICO_UTENTE_ITEMS_STEP;

  const isListHidden = safeVisibleCount === 0;

  const canShowInitial = canUsePagination && isListHidden;

  const canShowMore = canUsePagination && !isListHidden && remainingItems > 0;

  const canHideAll = canUsePagination && !isListHidden;

  return {
    totalItems,

    visibleItems: items.slice(0, safeVisibleCount),

    shouldShowActions: canShowInitial || canShowMore || canHideAll,

    canShowInitial,
    canShowMore,
    canHideAll,

    showingItemsLabel: getShowingItemsLabel({
      visibleCount: safeVisibleCount,
      totalItems,
    }),

    showMoreLabel: getShowMoreItemsLabel(nextItemsCount),

    showInitialLabel: getShowInitialItemsLabel(initialItemsCount),
  };
}

export function getNextHistoricoUtenteVisibleCount({
  currentVisibleCount,
  totalItems,
}) {
  const normalizedCurrentCount = Number(currentVisibleCount) || 0;

  return Math.min(
    normalizedCurrentCount + HISTORICO_UTENTE_ITEMS_STEP,
    totalItems,
  );
}

export function getInitialHistoricoUtenteVisibleCount(totalItems) {
  return Math.min(
    HISTORICO_UTENTE_ITEMS_STEP,
    Math.max(0, Number(totalItems) || 0),
  );
}
