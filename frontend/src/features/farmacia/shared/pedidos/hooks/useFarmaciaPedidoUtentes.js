// src/features/farmacia/shared/pedidos/hooks/useFarmaciaPedidoUtentes.js
import { useCallback, useMemo, useState } from "react";

function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function compareUtenteGroups(firstGroup, secondGroup) {
  const firstName = String(firstGroup?.utente?.nome || "");
  const secondName = String(secondGroup?.utente?.nome || "");

  const nameComparison = firstName.localeCompare(secondName, "pt-PT", {
    sensitivity: "base",
  });

  if (nameComparison !== 0) {
    return nameComparison;
  }

  return String(firstGroup?.utente?.numero9 || "").localeCompare(
    String(secondGroup?.utente?.numero9 || ""),
    "pt-PT",
  );
}

function getUtenteSearchValue(group) {
  return normalizeSearchValue(
    [group?.utente?.nome, group?.utente?.numero9].join(" "),
  );
}

export function useFarmaciaPedidoUtentes({ groups = [], pageSize = 10 }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedGroupKey, setExpandedGroupKey] = useState(null);

  const safeGroups = useMemo(() => {
    return Array.isArray(groups) ? groups : [];
  }, [groups]);

  const sortedGroups = useMemo(() => {
    return [...safeGroups].sort(compareUtenteGroups);
  }, [safeGroups]);

  const normalizedSearch = useMemo(() => {
    return normalizeSearchValue(search);
  }, [search]);

  const filteredGroups = useMemo(() => {
    if (!normalizedSearch) {
      return sortedGroups;
    }

    return sortedGroups.filter((group) => {
      return getUtenteSearchValue(group).includes(normalizedSearch);
    });
  }, [normalizedSearch, sortedGroups]);

  const safePageSize = Math.max(1, Number(pageSize) || 10);

  const totalGroups = filteredGroups.length;

  const totalPages = Math.max(1, Math.ceil(totalGroups / safePageSize));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const firstGroupIndex = (safeCurrentPage - 1) * safePageSize;

  const visibleGroups = filteredGroups.slice(
    firstGroupIndex,
    firstGroupIndex + safePageSize,
  );

  const rangeStart = totalGroups === 0 ? 0 : firstGroupIndex + 1;

  const rangeEnd =
    totalGroups === 0
      ? 0
      : Math.min(firstGroupIndex + safePageSize, totalGroups);

  const changeSearch = useCallback((nextSearch) => {
    setSearch(nextSearch);
    setCurrentPage(1);
    setExpandedGroupKey(null);
  }, []);

  const toggleGroup = useCallback((groupKey) => {
    setExpandedGroupKey((currentKey) => {
      return currentKey === groupKey ? null : groupKey;
    });
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((currentValue) => {
      const safeValue = Math.min(currentValue, totalPages);

      return Math.max(1, safeValue - 1);
    });

    setExpandedGroupKey(null);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((currentValue) => {
      const safeValue = Math.min(currentValue, totalPages);

      return Math.min(totalPages, safeValue + 1);
    });

    setExpandedGroupKey(null);
  }, [totalPages]);

  return {
    search,
    expandedGroupKey,

    visibleGroups,

    currentPage: safeCurrentPage,
    totalPages,
    totalGroups,

    rangeStart,
    rangeEnd,

    hasPreviousPage: safeCurrentPage > 1,
    hasNextPage: safeCurrentPage < totalPages,

    changeSearch,
    toggleGroup,
    goToPreviousPage,
    goToNextPage,
  };
}
