// src/features/santacasa/historico/hooks/useSantaCasaHistorico.js

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getSantaCasaHistorico } from "../api/santaCasaHistoricoApi";

import { buildSantaCasaHistoricoQuery } from "../utils/santaCasaHistoricoQuery.utils";

const DEFAULT_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 50,
});

const LOAD_ERROR_MESSAGE =
  "Não foi possível carregar o histórico da Santa Casa.";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getInitialMeta() {
  return {
    total: 0,
    skip: DEFAULT_QUERY.skip,
    take: DEFAULT_QUERY.take,
  };
}

export function useSantaCasaHistorico() {
  const { handleAuthError } = useAuth();

  const latestRequestIdRef = useRef(0);

  const [pedidos, setPedidos] = useState([]);
  const [meta, setMeta] = useState(getInitialMeta);

  const [query, setQuery] = useState(DEFAULT_QUERY);

  const [statusInput, setStatusInput] = useState(DEFAULT_QUERY.status);
  const [searchInput, setSearchInput] = useState(DEFAULT_QUERY.search);
  const [fromInput, setFromInput] = useState(DEFAULT_QUERY.from);
  const [toInput, setToInput] = useState(DEFAULT_QUERY.to);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const currentQuery = useMemo(() => {
    return buildSantaCasaHistoricoQuery(query);
  }, [query]);

  const safeTake = Math.max(1, Number(meta?.take) || DEFAULT_QUERY.take);
  const safeSkip = Math.max(0, Number(meta?.skip) || 0);
  const safeTotal = Math.max(0, Number(meta?.total) || 0);

  const totalPages = Math.max(1, Math.ceil(safeTotal / safeTake));

  const currentPage = Math.min(totalPages, Math.floor(safeSkip / safeTake) + 1);

  const hasPreviousPage = safeSkip > 0;
  const hasNextPage = safeSkip + safeTake < safeTotal;

  const executeHistoricoRequest = useCallback(
    async ({ requestQuery, mode = "loading" }) => {
      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      try {
        const result = await getSantaCasaHistorico(requestQuery);

        if (requestId !== latestRequestIdRef.current) return;

        setPedidos(result.data);
        setMeta(result.meta);
        setError(null);
      } catch (requestError) {
        if (requestId !== latestRequestIdRef.current) return;
        if (handleAuthError(requestError)) return;

        setError(getErrorMessage(requestError, LOAD_ERROR_MESSAGE));
      } finally {
        const isLatestRequest = requestId === latestRequestIdRef.current;

        if (isLatestRequest) {
          if (mode === "refreshing") {
            setIsRefreshing(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [handleAuthError],
  );

  const refreshHistorico = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    await executeHistoricoRequest({
      requestQuery: currentQuery,
      mode: "refreshing",
    });
  }, [currentQuery, executeHistoricoRequest]);

  const updateStatusInput = useCallback((value) => {
    setStatusInput(value);
  }, []);

  const updateSearchInput = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const updateFromInput = useCallback((value) => {
    setFromInput(value);
  }, []);

  const updateToInput = useCallback((value) => {
    setToInput(value);
  }, []);

  const applyFilters = useCallback(() => {
    setIsLoading(true);
    setError(null);

    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      status: statusInput,
      search: searchInput,
      from: fromInput,
      to: toInput,
      skip: 0,
    }));
  }, [fromInput, searchInput, statusInput, toInput]);

  const clearFilters = useCallback(() => {
    setStatusInput(DEFAULT_QUERY.status);
    setSearchInput(DEFAULT_QUERY.search);
    setFromInput(DEFAULT_QUERY.from);
    setToInput(DEFAULT_QUERY.to);

    setIsLoading(true);
    setError(null);

    setQuery({
      ...DEFAULT_QUERY,
    });
  }, []);

  const goToPreviousPage = useCallback(() => {
    if (!hasPreviousPage) return;

    setIsLoading(true);
    setError(null);

    setQuery((currentQueryValue) => {
      const currentSkip = Math.max(0, Number(currentQueryValue.skip) || 0);

      const currentTake = Math.max(
        1,
        Number(currentQueryValue.take) || DEFAULT_QUERY.take,
      );

      return {
        ...currentQueryValue,
        skip: Math.max(0, currentSkip - currentTake),
      };
    });
  }, [hasPreviousPage]);

  const goToNextPage = useCallback(() => {
    if (!hasNextPage) return;

    setIsLoading(true);
    setError(null);

    setQuery((currentQueryValue) => {
      const currentSkip = Math.max(0, Number(currentQueryValue.skip) || 0);

      const currentTake = Math.max(
        1,
        Number(currentQueryValue.take) || DEFAULT_QUERY.take,
      );

      return {
        ...currentQueryValue,
        skip: currentSkip + currentTake,
      };
    });
  }, [hasNextPage]);

  useEffect(() => {
    let isCancelled = false;

    queueMicrotask(() => {
      if (isCancelled) return;

      void executeHistoricoRequest({
        requestQuery: currentQuery,
        mode: "loading",
      });
    });

    return () => {
      isCancelled = true;
      latestRequestIdRef.current += 1;
    };
  }, [currentQuery, executeHistoricoRequest]);

  return {
    pedidos,
    meta,

    statusInput,
    searchInput,
    fromInput,
    toInput,

    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    isLoading,
    isRefreshing,
    error,

    refreshHistorico,

    updateStatusInput,
    updateSearchInput,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  };
}
