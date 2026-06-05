import { useCallback, useMemo, useState } from "react";

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

const VISIBLE_ITEMS_STEP = 5;

function getSafeItems(group) {
  if (!Array.isArray(group?.items)) return [];

  return group.items;
}

function getPluralLabel(value, singular, plural) {
  return Number(value) === 1 ? singular : plural;
}

function getMedicamentoLabel(value) {
  return getPluralLabel(
    value,
    SANTACASA_HISTORICO_PAGE.labels.medicamentoSingular,
    SANTACASA_HISTORICO_PAGE.labels.medicamentoPlural,
  );
}

function getShowingItemsLabel(visibleCount, totalCount) {
  if (visibleCount === 0) {
    return SANTACASA_HISTORICO_PAGE.labels.hiddenItems;
  }

  return `${SANTACASA_HISTORICO_PAGE.labels.showingItems} ${visibleCount} ${SANTACASA_HISTORICO_PAGE.labels.of} ${totalCount} ${getMedicamentoLabel(totalCount)}.`;
}

function getShowMoreItemsLabel(count) {
  return `${SANTACASA_HISTORICO_PAGE.actions.showMoreItems} ${count} ${getMedicamentoLabel(count)}`;
}

function getShowInitialItemsLabel(count) {
  return `${SANTACASA_HISTORICO_PAGE.actions.showInitialItems} ${count} ${getMedicamentoLabel(count)}`;
}

export function useSantaCasaHistoricoUtenteGroup(
  group,
  { isSearchActive = false } = {},
) {
  const [visibleCount, setVisibleCount] = useState(VISIBLE_ITEMS_STEP);

  const items = useMemo(() => {
    return getSafeItems(group);
  }, [group]);

  const totalItems = items.length;

  const safeVisibleCount = isSearchActive
    ? totalItems
    : Math.min(visibleCount, totalItems);

  const remainingItems = Math.max(totalItems - safeVisibleCount, 0);
  const nextItemsCount = Math.min(VISIBLE_ITEMS_STEP, remainingItems);
  const initialItemsCount = Math.min(VISIBLE_ITEMS_STEP, totalItems);

  const visibleItems = useMemo(() => {
    return items.slice(0, safeVisibleCount);
  }, [items, safeVisibleCount]);

  const canShowControls = !isSearchActive && totalItems > VISIBLE_ITEMS_STEP;
  const isListHidden = safeVisibleCount === 0;

  const canShowInitial = canShowControls && isListHidden && totalItems > 0;
  const canShowMore = canShowControls && !isListHidden && remainingItems > 0;
  const canShowAll = canShowControls && !isListHidden && remainingItems > 0;
  const canHideAll = canShowControls && !isListHidden && totalItems > 0;

  const showingItemsLabel = getShowingItemsLabel(safeVisibleCount, totalItems);
  const showMoreLabel = getShowMoreItemsLabel(nextItemsCount);
  const showInitialLabel = getShowInitialItemsLabel(initialItemsCount);

  const handleShowMore = useCallback(() => {
    setVisibleCount((currentValue) => {
      return Math.min(currentValue + VISIBLE_ITEMS_STEP, totalItems);
    });
  }, [totalItems]);

  const handleShowAll = useCallback(() => {
    setVisibleCount(totalItems);
  }, [totalItems]);

  const handleHideAll = useCallback(() => {
    setVisibleCount(0);
  }, []);

  const handleShowInitial = useCallback(() => {
    setVisibleCount(VISIBLE_ITEMS_STEP);
  }, []);

  return {
    visibleItems,
    canShowControls,
    canShowInitial,
    canShowMore,
    canShowAll,
    canHideAll,
    showingItemsLabel,
    showMoreLabel,
    showInitialLabel,
    handleShowInitial,
    handleShowMore,
    handleShowAll,
    handleHideAll,
  };
}
