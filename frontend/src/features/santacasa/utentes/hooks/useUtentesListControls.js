// src/features/santacasa/utentes/hooks/useUtentesListControls.js

import { useCallback, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import {
  buildInitialPagination,
  buildUtenteStatusSearchParams,
  getCurrentPage,
  getNextPageSkip,
  getPreviousPageSkip,
  getTotalPages,
  getUtenteStatusFromSearchParams,
  hasNextPage,
  hasPreviousPage,
  normalizeUtenteStatusFilter,
} from "../utils/utentesState.utils";

export function useUtentesListControls({ onControlsChange } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [pagination, setPagination] = useState(buildInitialPagination);

  const statusFilter = useMemo(() => {
    return getUtenteStatusFromSearchParams(searchParams);
  }, [searchParams]);

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
      const normalizedStatus = normalizeUtenteStatusFilter(nextStatus);

      if (normalizedStatus === statusFilter) {
        return;
      }

      const nextSearchParams = buildUtenteStatusSearchParams({
        currentSearchParams: searchParams,
        status: normalizedStatus,
      });

      setSearchParams(nextSearchParams);

      resetPage();
      notifyControlsChange();
    },
    [
      notifyControlsChange,
      resetPage,
      searchParams,
      setSearchParams,
      statusFilter,
    ],
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
