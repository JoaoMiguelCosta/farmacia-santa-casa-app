// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/useRegularizacoesGroupVisibility.js

import { useCallback, useState } from "react";

export function useRegularizacoesGroupVisibility({
  initialVisibleCount,
  visibleIncrement,
}) {
  const [openGroupKeys, setOpenGroupKeys] = useState(() => new Set());
  const [visibleCountsByGroupKey, setVisibleCountsByGroupKey] = useState(
    () => ({}),
  );

  const getVisibleCount = useCallback(
    (groupKey) => {
      return visibleCountsByGroupKey[groupKey] || initialVisibleCount;
    },
    [initialVisibleCount, visibleCountsByGroupKey],
  );

  const toggleGroup = useCallback((groupKey) => {
    setOpenGroupKeys((currentGroupKeys) => {
      const nextGroupKeys = new Set(currentGroupKeys);

      if (nextGroupKeys.has(groupKey)) {
        nextGroupKeys.delete(groupKey);
      } else {
        nextGroupKeys.add(groupKey);
      }

      return nextGroupKeys;
    });
  }, []);

  const showMore = useCallback(
    (groupKey, totalItems) => {
      setVisibleCountsByGroupKey((currentCounts) => {
        const currentCount = currentCounts[groupKey] || initialVisibleCount;

        return {
          ...currentCounts,
          [groupKey]: Math.min(currentCount + visibleIncrement, totalItems),
        };
      });
    },
    [initialVisibleCount, visibleIncrement],
  );

  const showAll = useCallback((groupKey, totalItems) => {
    setVisibleCountsByGroupKey((currentCounts) => ({
      ...currentCounts,
      [groupKey]: totalItems,
    }));
  }, []);

  return {
    openGroupKeys,
    getVisibleCount,
    toggleGroup,
    showMore,
    showAll,
  };
}
