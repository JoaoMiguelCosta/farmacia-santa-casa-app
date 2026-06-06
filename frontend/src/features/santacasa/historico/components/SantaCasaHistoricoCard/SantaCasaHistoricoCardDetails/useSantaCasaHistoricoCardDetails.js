// src/features/santacasa/historico/components/SantaCasaHistoricoCard/useSantaCasaHistoricoCardDetails.js

import { useMemo, useState } from "react";

import {
  filterHistoricoPedidoItems,
  getHistoricoPedidoItemGroups,
} from "./santaCasaHistoricoCardDetails.utils";

export function useSantaCasaHistoricoCardDetails(items = []) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return filterHistoricoPedidoItems(items, search);
  }, [items, search]);

  const groups = useMemo(() => {
    return getHistoricoPedidoItemGroups(filteredItems);
  }, [filteredItems]);

  const totalItems = Array.isArray(items) ? items.length : 0;

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
