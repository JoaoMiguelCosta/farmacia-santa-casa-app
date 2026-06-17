// src/features/santacasa/pedidos/components/PedidoGeralList/usePedidoGeralGroup.js

import { useCallback, useMemo, useState } from "react";

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

import {
  getItemsQuantityTotal,
  getMedicamentosCountLabel,
  getPedidoGeralReceita,
  getSafeDetailsId,
  getTypeLabel,
  getUnidadesCountLabel,
  getValidPedidoGeralItems,
} from "./pedidoGeralList.utils";

const ALL_FILTER = "ALL";

const FILTER_KEYS = new Set([
  ALL_FILTER,
  "COM_RECEITA",
  "EXTRA",
  "SEM_RECEITA",
]);

function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getItemSearchValue(item) {
  const receita = getPedidoGeralReceita(item);

  return normalizeSearchValue(
    [
      item?.title,
      item?.medicamento,
      item?.nome,
      item?.description,
      item?.meta,

      getTypeLabel(item?.tipo),

      receita?.numero19,
      receita?.pinAcesso6,
      receita?.pinOpcao4,
    ].join(" "),
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

function getSafeFilter(value) {
  return FILTER_KEYS.has(value) ? value : ALL_FILTER;
}

export function usePedidoGeralGroup({ group, defaultOpen = false }) {
  const { pageSize } = PEDIDOS_PAGE.sections.draft.itemsList;

  const detailsId = getSafeDetailsId("pedido-geral-utente", group?.utenteId);

  const [isOpen, setIsOpen] = useState(defaultOpen);

  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const [currentPage, setCurrentPage] = useState(1);

  const items = useMemo(() => {
    return getValidPedidoGeralItems(group?.items);
  }, [group?.items]);

  const normalizedSearch = useMemo(() => {
    return normalizeSearchValue(search);
  }, [search]);

  const filterCounts = useMemo(() => {
    return getFilterCounts(items);
  }, [items]);

  const filteredItems = useMemo(() => {
    const safeFilter = getSafeFilter(activeFilter);

    return items.filter((item) => {
      const matchesFilter =
        safeFilter === ALL_FILTER || item?.tipo === safeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getItemSearchValue(item).includes(normalizedSearch);
    });
  }, [activeFilter, items, normalizedSearch]);

  const safePageSize = Math.max(1, Math.floor(Number(pageSize)) || 10);

  const totalFilteredItems = filteredItems.length;

  const totalPages = Math.max(1, Math.ceil(totalFilteredItems / safePageSize));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const firstItemIndex = (safeCurrentPage - 1) * safePageSize;

  const visibleItems = filteredItems.slice(
    firstItemIndex,
    firstItemIndex + safePageSize,
  );

  const rangeStart = totalFilteredItems === 0 ? 0 : firstItemIndex + 1;

  const rangeEnd =
    totalFilteredItems === 0
      ? 0
      : Math.min(firstItemIndex + safePageSize, totalFilteredItems);

  const totalMedicamentos = items.length;

  const totalQuantidade = getItemsQuantityTotal(items);

  const totalMedicamentosLabel = getMedicamentosCountLabel(totalMedicamentos);

  const totalQuantidadeLabel = getUnidadesCountLabel(totalQuantidade);

  const toggleLabel = isOpen
    ? PEDIDOS_PAGE.actions.hideMedicamentos
    : PEDIDOS_PAGE.actions.viewMedicamentos;

  const handleToggleOpen = useCallback(() => {
    setIsOpen((currentValue) => !currentValue);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(getSafeFilter(filter));

    setCurrentPage(1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((currentValue) => {
      const safeValue = Math.min(currentValue, totalPages);

      return Math.max(1, safeValue - 1);
    });
  }, [totalPages]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((currentValue) => {
      const safeValue = Math.min(currentValue, totalPages);

      return Math.min(totalPages, safeValue + 1);
    });
  }, [totalPages]);

  return {
    detailsId,

    isOpen,
    search,
    activeFilter,

    filterCounts,
    visibleItems,

    currentPage: safeCurrentPage,
    totalPages,
    totalFilteredItems,

    rangeStart,
    rangeEnd,

    hasPreviousPage: safeCurrentPage > 1,

    hasNextPage: safeCurrentPage < totalPages,

    totalMedicamentosLabel,
    totalQuantidadeLabel,
    toggleLabel,

    handleToggleOpen,
    handleSearchChange,
    handleFilterChange,

    handlePreviousPage,
    handleNextPage,
  };
}
