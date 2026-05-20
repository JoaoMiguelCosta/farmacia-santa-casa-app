// src/features/santacasa/utentes/hooks/useSantaCasaUtentes.js
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  archiveUtente,
  createUtente,
  deleteUtente,
  getUtentesPaginated,
  reactivateUtente,
} from "../api/utentesApi";

import { UTENTES_PAGE } from "../config/utentesPage.config";

import {
  UTENTE_ACTION_MESSAGES,
  UTENTE_ARCHIVE_DEFAULT_REASON,
  UTENTE_STATUS,
  UTENTE_STATUS_FILTER_OPTIONS,
} from "../config/utentesStatus.config";

import { sortUtentesByName } from "../utils/sortUtentes";

const DEFAULT_STATUS_FILTER = UTENTE_STATUS.ATIVO;
const DEFAULT_PAGE_SIZE = 50;

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function buildArchivePayload({
  archivedReason = UTENTE_ARCHIVE_DEFAULT_REASON,
} = {}) {
  return {
    archivedReason: archivedReason || UTENTE_ARCHIVE_DEFAULT_REASON,
  };
}

function buildInitialPagination() {
  return {
    total: 0,
    skip: 0,
    take: DEFAULT_PAGE_SIZE,
  };
}

function shouldKeepUtenteInCurrentFilter(utente, statusFilter) {
  if (!utente) return false;
  if (statusFilter === UTENTE_STATUS.TODOS) return true;

  return utente.status === statusFilter;
}

function doesUtenteMatchSearch(utente, searchQuery) {
  const search = String(searchQuery || "")
    .trim()
    .toLowerCase();

  if (!search) return true;

  return (
    String(utente?.nome || "")
      .toLowerCase()
      .includes(search) || String(utente?.numero9 || "").includes(search)
  );
}

export function useSantaCasaUtentes() {
  const { handleAuthError } = useAuth();

  const [utentes, setUtentes] = useState([]);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [pagination, setPagination] = useState(buildInitialPagination);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [deletingUtenteId, setDeletingUtenteId] = useState(null);
  const [archivingUtenteId, setArchivingUtenteId] = useState(null);
  const [reactivatingUtenteId, setReactivatingUtenteId] = useState(null);

  const [utenteToDelete, setUtenteToDelete] = useState(null);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const hasUtentes = utentes.length > 0;

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.take));
  const currentPage = Math.min(
    totalPages,
    Math.floor(pagination.skip / pagination.take) + 1,
  );

  const hasPreviousPage = pagination.skip > 0;
  const hasNextPage = pagination.skip + pagination.take < pagination.total;

  const isActionRunning = useMemo(() => {
    return Boolean(
      deletingUtenteId || archivingUtenteId || reactivatingUtenteId,
    );
  }, [archivingUtenteId, deletingUtenteId, reactivatingUtenteId]);

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

        setPagination({
          total: result.total,
          skip: Number(result.params?.skip) || 0,
          take: Number(result.params?.take) || DEFAULT_PAGE_SIZE,
        });
      } catch (requestError) {
        if (handleAuthError(requestError)) return;

        setError(getErrorMessage(requestError, "Erro ao carregar utentes."));
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
      statusFilter,
    ],
  );

  const handleRefreshUtentes = useCallback(async () => {
    await loadUtentes({ showRefreshing: true });
  }, [loadUtentes]);

  const updateStatusFilter = useCallback((nextStatus) => {
    setStatusFilter(nextStatus || DEFAULT_STATUS_FILTER);
    setPagination((currentPagination) => ({
      ...currentPagination,
      skip: 0,
    }));
    setFeedback(null);
    setError(null);
  }, []);

  const updateSearchInput = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const handleSubmitSearch = useCallback(
    (event) => {
      event?.preventDefault?.();

      const nextSearch = searchInput.trim();

      setSearchQuery(nextSearch);
      setPagination((currentPagination) => ({
        ...currentPagination,
        skip: 0,
      }));
      setFeedback(null);
      setError(null);
    },
    [searchInput],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setPagination((currentPagination) => ({
      ...currentPagination,
      skip: 0,
    }));
    setFeedback(null);
    setError(null);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      skip: Math.max(0, currentPagination.skip - currentPagination.take),
    }));
  }, []);

  const handleNextPage = useCallback(() => {
    setPagination((currentPagination) => {
      const nextSkip = currentPagination.skip + currentPagination.take;

      if (nextSkip >= currentPagination.total) {
        return currentPagination;
      }

      return {
        ...currentPagination,
        skip: nextSkip,
      };
    });
  }, []);

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

        const message = getErrorMessage(requestError, "Erro ao criar utente.");

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

  const handleArchiveUtente = useCallback(
    async (utente, options = {}) => {
      if (!utente?.id) {
        setFeedback({
          type: "error",
          message: UTENTE_ACTION_MESSAGES.invalidUtente,
        });

        return null;
      }

      const payload = buildArchivePayload(options);

      setArchivingUtenteId(utente.id);
      setFeedback(null);

      try {
        const updatedUtente = await archiveUtente(utente.id, payload);

        await loadUtentes({ showRefreshing: true });

        setFeedback({
          type: "success",
          message: UTENTE_ACTION_MESSAGES.archiveSuccess,
        });

        return updatedUtente;
      } catch (requestError) {
        if (handleAuthError(requestError)) return null;

        setFeedback({
          type: "error",
          message: getErrorMessage(
            requestError,
            UTENTE_ACTION_MESSAGES.archiveError,
          ),
        });

        return null;
      } finally {
        setArchivingUtenteId(null);
      }
    },
    [handleAuthError, loadUtentes],
  );

  const handleReactivateUtente = useCallback(
    async (utente) => {
      if (!utente?.id) {
        setFeedback({
          type: "error",
          message: UTENTE_ACTION_MESSAGES.invalidUtente,
        });

        return null;
      }

      setReactivatingUtenteId(utente.id);
      setFeedback(null);

      try {
        const updatedUtente = await reactivateUtente(utente.id);

        await loadUtentes({ showRefreshing: true });

        setFeedback({
          type: "success",
          message: UTENTE_ACTION_MESSAGES.reactivateSuccess,
        });

        return updatedUtente;
      } catch (requestError) {
        if (handleAuthError(requestError)) return null;

        setFeedback({
          type: "error",
          message: getErrorMessage(
            requestError,
            UTENTE_ACTION_MESSAGES.reactivateError,
          ),
        });

        return null;
      } finally {
        setReactivatingUtenteId(null);
      }
    },
    [handleAuthError, loadUtentes],
  );

  const handleRequestDeleteUtente = useCallback((utente) => {
    setUtenteToDelete(utente);
    setFeedback(null);
  }, []);

  const handleCancelDeleteUtente = useCallback(() => {
    if (deletingUtenteId) return;

    setUtenteToDelete(null);
  }, [deletingUtenteId]);

  const handleConfirmDeleteUtente = useCallback(async () => {
    if (!utenteToDelete) return;

    setDeletingUtenteId(utenteToDelete.id);
    setFeedback(null);

    try {
      await deleteUtente(utenteToDelete.id);
      await loadUtentes({ showRefreshing: true });

      setFeedback({
        type: "success",
        message: UTENTE_ACTION_MESSAGES.deleteSuccess,
      });

      setUtenteToDelete(null);
    } catch (requestError) {
      if (handleAuthError(requestError)) return;

      setFeedback({
        type: "error",
        message: getErrorMessage(
          requestError,
          UTENTE_ACTION_MESSAGES.deleteError,
        ),
      });
    } finally {
      setDeletingUtenteId(null);
    }
  }, [handleAuthError, loadUtentes, utenteToDelete]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUtentes() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getUtentesPaginated({
          status: statusFilter,
          search: searchQuery,
          skip: pagination.skip,
          take: pagination.take,
        });

        if (!isMounted) return;

        setUtentes(sortUtentesByName(result.rows));
        setPagination({
          total: result.total,
          skip: Number(result.params?.skip) || 0,
          take: Number(result.params?.take) || DEFAULT_PAGE_SIZE,
        });
        setError(null);
      } catch (requestError) {
        if (!isMounted) return;
        if (handleAuthError(requestError)) return;

        setError(getErrorMessage(requestError, "Erro ao carregar utentes."));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialUtentes();

    return () => {
      isMounted = false;
    };
  }, [
    handleAuthError,
    pagination.skip,
    pagination.take,
    searchQuery,
    statusFilter,
  ]);

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
