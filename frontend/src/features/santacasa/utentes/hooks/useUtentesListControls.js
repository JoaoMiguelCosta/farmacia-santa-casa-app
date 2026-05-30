// src/features/santacasa/utentes/hooks/useUtentesListControls.js
import { useCallback, useState } from "react";

import {
  UTENTES_DEFAULTS,
  buildInitialPagination,
  getCurrentPage,
  getNextPageSkip,
  getPreviousPageSkip,
  getTotalPages,
  hasNextPage,
  hasPreviousPage,
} from "../utils/utentesState.utils";

export function useUtentesListControls({ onControlsChange } = {}) {
  const [statusFilter, setStatusFilter] = useState(
    UTENTES_DEFAULTS.statusFilter,
  );

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [pagination, setPagination] = useState(buildInitialPagination);

  const totalPages = getTotalPages(pagination);
  const currentPage = getCurrentPage(pagination);

  const hasPreviousPageValue = hasPreviousPage(pagination);
  const hasNextPageValue = hasNextPage(pagination);

  const resetPage = useCallback(() => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      skip: 0,
    }));
  }, []);

  const notifyControlsChange = useCallback(() => {
    onControlsChange?.();
  }, [onControlsChange]);

  const updateStatusFilter = useCallback(
    (nextStatus) => {
      setStatusFilter(nextStatus || UTENTES_DEFAULTS.statusFilter);
      resetPage();
      notifyControlsChange();
    },
    [notifyControlsChange, resetPage],
  );

  const updateSearchInput = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const handleSubmitSearch = useCallback(
    (event) => {
      event?.preventDefault?.();

      setSearchQuery(searchInput.trim());
      resetPage();
      notifyControlsChange();
    },
    [notifyControlsChange, resetPage, searchInput],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    resetPage();
    notifyControlsChange();
  }, [notifyControlsChange, resetPage]);

  const handlePreviousPage = useCallback(() => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      skip: getPreviousPageSkip(currentPagination),
    }));
  }, []);

  const handleNextPage = useCallback(() => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      skip: getNextPageSkip(currentPagination),
    }));
  }, []);

  return {
    statusFilter,
    searchInput,
    searchQuery,

    pagination,
    setPagination,

    currentPage,
    totalPages,
    hasPreviousPage: hasPreviousPageValue,
    hasNextPage: hasNextPageValue,

    updateStatusFilter,
    updateSearchInput,
    handleSubmitSearch,
    handleClearSearch,
    handlePreviousPage,
    handleNextPage,
  };
}
