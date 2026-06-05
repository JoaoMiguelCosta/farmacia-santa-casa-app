import { useMemo, useState } from "react";

import {
  getHistoricoPedidoItemGroups,
  getHistoricoPedidoItemGroupsSearchIndex,
} from "./santaCasaHistoricoCardDetails.utils";

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("pt-PT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesSearch(item, query) {
  if (!query) return true;

  return getHistoricoPedidoItemGroupsSearchIndex(item).includes(query);
}

function filterHistoricoPedidoItems(items, search) {
  const normalizedSearch = normalizeSearch(search);

  if (!normalizedSearch) return items;

  return items.filter((item) => matchesSearch(item, normalizedSearch));
}

export function useSantaCasaHistoricoCardDetails(items = []) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return filterHistoricoPedidoItems(items, search);
  }, [items, search]);

  const groups = useMemo(() => {
    return getHistoricoPedidoItemGroups(filteredItems);
  }, [filteredItems]);

  const totalItems = items.length;
  const filteredItemsCount = filteredItems.length;
  const hasSearch = search.trim().length > 0;
  const hasGroups = groups.length > 0;

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  function handleClearSearch() {
    setSearch("");
  }

  return {
    search,
    groups,
    totalItems,
    filteredItemsCount,
    hasSearch,
    hasGroups,
    handleSearchChange,
    handleClearSearch,
  };
}
