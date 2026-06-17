// src/features/santacasa/utentes/hooks/useSantaCasaUtentes.js
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { createUtente, getUtentesPaginated } from "../api/utentesApi";

import { UTENTES_PAGE } from "../config/utentesPage.config";

import { UTENTE_STATUS_FILTER_OPTIONS } from "../config/utentesStatus.config";

import { useUtenteActions } from "./useUtenteActions";
import { useUtentesListControls } from "./useUtentesListControls";

import { sortUtentesByName } from "../utils/sortUtentes";

import {
  doesUtenteMatchSearch,
  getErrorMessage,
  normalizePaginationParams,
  shouldKeepUtenteInCurrentFilter,
} from "../utils/utentesState.utils";

export function useSantaCasaUtentes() {
  const { handleAuthError } = useAuth();

  const [utentes, setUtentes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const clearTransientState = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  const {
    statusFilter,
    searchInput,
    searchQuery,

    pagination,
    setPagination,

    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    updateStatusFilter,
    updateSearchInput,
    handleSubmitSearch,
    handleClearSearch,
    handlePreviousPage,
    handleNextPage,
  } = useUtentesListControls({
    onControlsChange: clearTransientState,
  });

  const hasUtentes = utentes.length > 0;

  const loadUtentes = useCallback(
    async ({
      showRefreshing = false,
      nextSkip = pagination.skip,
      nextSearch = searchQuery,
      nextStatus = statusFilter,
    } = {}) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await getUtentesPaginated({
          status: nextStatus,
          search: nextSearch,
          skip: nextSkip,
          take: pagination.take,
        });

        setUtentes(sortUtentesByName(result.rows));

        setPagination(
          normalizePaginationParams({
            total: result.total,
            skip: result.params?.skip,
            take: result.params?.take,
          }),
        );
      } catch (requestError) {
        if (handleAuthError(requestError)) return;

        setError(getErrorMessage(requestError, UTENTES_PAGE.list.errorMessage));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      handleAuthError,
      pagination.skip,
      pagination.take,
      searchQuery,
      setPagination,
      statusFilter,
    ],
  );

  const {
    isActionRunning,

    deletingUtenteId,
    archivingUtenteId,
    reactivatingUtenteId,

    utenteToDelete,

    handleArchiveUtente,
    handleReactivateUtente,

    handleRequestDeleteUtente,
    handleCancelDeleteUtente,
    handleConfirmDeleteUtente,
  } = useUtenteActions({
    handleAuthError,
    loadUtentes,
    setFeedback,
  });

  const handleRefreshUtentes = useCallback(async () => {
    await loadUtentes({ showRefreshing: true });
  }, [loadUtentes]);

  const handleCreateUtente = useCallback(
    async (payload) => {
      setIsCreating(true);
      setFeedback(null);

      try {
        const createdUtente = await createUtente(payload);

        setError(null);

        setFeedback({
          type: "success",
          message: UTENTES_PAGE.form.successMessage,
        });

        if (
          shouldKeepUtenteInCurrentFilter(createdUtente, statusFilter) &&
          doesUtenteMatchSearch(createdUtente, searchQuery)
        ) {
          await loadUtentes({
            showRefreshing: true,
            nextSkip: 0,
          });
        }

        return {
          ok: true,
          fieldErrors: {},
          message: null,
        };
      } catch (requestError) {
        if (handleAuthError(requestError)) {
          return {
            ok: false,
            fieldErrors: {},
            message: null,
          };
        }

        const message = getErrorMessage(
          requestError,
          UTENTES_PAGE.form.errorMessage,
        );

        setFeedback({
          type: "error",
          message,
        });

        return {
          ok: false,
          fieldErrors: {},
          message,
        };
      } finally {
        setIsCreating(false);
      }
    },
    [handleAuthError, loadUtentes, searchQuery, statusFilter],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUtentes();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadUtentes]);

  return {
    utentes,
    hasUtentes,

    statusFilter,
    statusOptions: UTENTE_STATUS_FILTER_OPTIONS,

    searchInput,
    searchQuery,

    pagination,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    isLoading,
    isRefreshing,
    isCreating,
    isActionRunning,

    deletingUtenteId,
    archivingUtenteId,
    reactivatingUtenteId,

    utenteToDelete,

    error,
    feedback,
    setFeedback,

    loadUtentes,
    handleRefreshUtentes,
    updateStatusFilter,
    updateSearchInput,
    handleSubmitSearch,
    handleClearSearch,
    handlePreviousPage,
    handleNextPage,

    handleCreateUtente,
    handleArchiveUtente,
    handleReactivateUtente,

    handleRequestDeleteUtente,
    handleCancelDeleteUtente,
    handleConfirmDeleteUtente,
  };
}
