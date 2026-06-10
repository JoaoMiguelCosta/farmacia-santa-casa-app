import { useCallback, useMemo, useState } from "react";

import {
  getSantaCasaPedidoItemMedicationLabel,
  getSantaCasaPedidoItemReceita,
  getSantaCasaPedidoItemStatusLabel,
  getSantaCasaPedidoItemTypeLabel,
} from "../../../../utils/santaCasaPedido.utils";

const ALL_FILTER = "ALL";

const ITEM_TYPE_ORDER = Object.freeze({
  COM_RECEITA: 0,
  EXTRA: 1,
  SEM_RECEITA: 2,
});

function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getItemSearchValue(item) {
  const receita = getSantaCasaPedidoItemReceita(item);

  return normalizeSearchValue(
    [
      getSantaCasaPedidoItemMedicationLabel(item),

      getSantaCasaPedidoItemTypeLabel(item?.tipo),

      getSantaCasaPedidoItemStatusLabel(item?.status),

      receita?.numero19,
      receita?.pinAcesso6,
      receita?.pinOpcao4,
    ].join(" "),
  );
}

function compareItems(firstItem, secondItem) {
  const firstTypeOrder =
    ITEM_TYPE_ORDER[firstItem?.tipo] ?? Number.MAX_SAFE_INTEGER;

  const secondTypeOrder =
    ITEM_TYPE_ORDER[secondItem?.tipo] ?? Number.MAX_SAFE_INTEGER;

  if (firstTypeOrder !== secondTypeOrder) {
    return firstTypeOrder - secondTypeOrder;
  }

  return getSantaCasaPedidoItemMedicationLabel(firstItem).localeCompare(
    getSantaCasaPedidoItemMedicationLabel(secondItem),
    "pt-PT",
    {
      sensitivity: "base",
    },
  );
}

function getFilterCounts(items) {
  return items.reduce(
    (counts, item) => {
      counts.ALL += 1;

      if (Object.hasOwn(counts, item?.tipo)) {
        counts[item.tipo] += 1;
      }

      return counts;
    },
    {
      ALL: 0,
      COM_RECEITA: 0,
      EXTRA: 0,
      SEM_RECEITA: 0,
    },
  );
}

export function useSantaCasaPedidoUtenteItems({ items = [], pageSize = 10 }) {
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const [currentPage, setCurrentPage] = useState(1);

  const [expandedItemKey, setExpandedItemKey] = useState(null);

  const safeItems = useMemo(() => {
    return Array.isArray(items) ? items : [];
  }, [items]);

  const sortedItems = useMemo(() => {
    return [...safeItems].sort(compareItems);
  }, [safeItems]);

  const filterCounts = useMemo(() => {
    return getFilterCounts(sortedItems);
  }, [sortedItems]);

  const normalizedSearch = useMemo(() => {
    return normalizeSearchValue(search);
  }, [search]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      const matchesFilter =
        activeFilter === ALL_FILTER || item?.tipo === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getItemSearchValue(item).includes(normalizedSearch);
    });
  }, [activeFilter, normalizedSearch, sortedItems]);

  const safePageSize = Math.max(1, Math.floor(Number(pageSize)) || 10);

  const totalItems = filteredItems.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const firstItemIndex = (safeCurrentPage - 1) * safePageSize;

  const visibleItems = filteredItems.slice(
    firstItemIndex,
    firstItemIndex + safePageSize,
  );

  const rangeStart = totalItems === 0 ? 0 : firstItemIndex + 1;

  const rangeEnd =
    totalItems === 0 ? 0 : Math.min(firstItemIndex + safePageSize, totalItems);

  const changeSearch = useCallback((nextSearch) => {
    setSearch(nextSearch);
    setCurrentPage(1);
    setExpandedItemKey(null);
  }, []);

  const changeFilter = useCallback((nextFilter) => {
    setActiveFilter(nextFilter);
    setCurrentPage(1);
    setExpandedItemKey(null);
  }, []);

  const toggleItem = useCallback((itemKey) => {
    setExpandedItemKey((currentKey) => {
      return currentKey === itemKey ? null : itemKey;
    });
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((currentValue) => {
      const safeValue = Math.min(currentValue, totalPages);

      return Math.max(1, safeValue - 1);
    });

    setExpandedItemKey(null);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((currentValue) => {
      const safeValue = Math.min(currentValue, totalPages);

      return Math.min(totalPages, safeValue + 1);
    });

    setExpandedItemKey(null);
  }, [totalPages]);

  return {
    search,
    activeFilter,
    expandedItemKey,

    visibleItems,
    filterCounts,

    currentPage: safeCurrentPage,
    totalPages,
    totalItems,

    rangeStart,
    rangeEnd,

    hasPreviousPage: safeCurrentPage > 1,

    hasNextPage: safeCurrentPage < totalPages,

    changeSearch,
    changeFilter,
    toggleItem,

    goToPreviousPage,
    goToNextPage,
  };
}
