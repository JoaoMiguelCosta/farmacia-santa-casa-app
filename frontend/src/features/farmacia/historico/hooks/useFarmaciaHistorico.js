// src/features/farmacia/historico/hooks/useFarmaciaHistorico.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getFarmaciaHistorico } from "../api/farmaciaHistoricoApi";

import {
  buildFarmaciaHistoricoQuery,
  buildFarmaciaHistoricoSearchParams,
  getFarmaciaHistoricoQueryFromSearchParams,
} from "../utils/farmaciaHistorico.utils";

const DEFAULT_HISTORICO_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 10,
});

const LOAD_ERROR_MESSAGE = "Não foi possível carregar o histórico da Farmácia.";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getSafeMeta(meta, fallbackQuery) {
  const total = Number(meta?.total);
  const skip = Number(meta?.skip);
  const take = Number(meta?.take);

  return {
    total: Number.isFinite(total) && total >= 0 ? total : 0,

    skip: Number.isFinite(skip) && skip >= 0 ? skip : fallbackQuery.skip,

    take: Number.isFinite(take) && take > 0 ? take : fallbackQuery.take,
  };
}

function getPagination(meta, pedidosCount) {
  const total = Math.max(0, Number(meta?.total) || 0);

  const skip = Math.max(0, Number(meta?.skip) || 0);

  const take = Math.max(1, Number(meta?.take) || DEFAULT_HISTORICO_QUERY.take);

  const totalPages = Math.max(1, Math.ceil(total / take));

  const currentPage = Math.min(totalPages, Math.floor(skip / take) + 1);

  const rangeStart = total === 0 ? 0 : skip + 1;

  const rangeEnd = total === 0 ? 0 : Math.min(skip + pedidosCount, total);

  return {
    currentPage,
    totalPages,

    rangeStart,
    rangeEnd,

    hasPreviousPage: skip > 0,
    hasNextPage: skip + take < total,
  };
}

export function useFarmaciaHistorico(initialQuery = DEFAULT_HISTORICO_QUERY) {
  const { handleAuthError } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [initialQueryState] = useState(() => {
    return buildFarmaciaHistoricoQuery({
      ...DEFAULT_HISTORICO_QUERY,
      ...initialQuery,
    });
  });

  const latestRequestIdRef = useRef(0);

  const searchParamsKey = searchParams.toString();

  const currentQuery = useMemo(() => {
    return getFarmaciaHistoricoQueryFromSearchParams(
      searchParamsKey,
      initialQueryState,
    );
  }, [initialQueryState, searchParamsKey]);

  const [pedidos, setPedidos] = useState([]);

  const [meta, setMeta] = useState(() => {
    return getSafeMeta(null, initialQueryState);
  });

  const [statusInput, setStatusInput] = useState(currentQuery.status);

  const [searchInput, setSearchInput] = useState(currentQuery.search);

  const [fromInput, setFromInput] = useState(currentQuery.from);

  const [toInput, setToInput] = useState(currentQuery.to);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isQuerying, setIsQuerying] = useState(false);

  const [error, setError] = useState(null);

  const pagination = useMemo(() => {
    return getPagination(meta, pedidos.length);
  }, [meta, pedidos.length]);

  const executeHistoricoRequest = useCallback(
    async (requestQuery, requestId) => {
      try {
        const result = await getFarmaciaHistorico(requestQuery);

        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        setPedidos(result.data);

        setMeta(getSafeMeta(result.meta, requestQuery));

        return result;
      } catch (loadError) {
        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        if (handleAuthError(loadError)) {
          return null;
        }

        setError(getErrorMessage(loadError, LOAD_ERROR_MESSAGE));

        return null;
      }
    },
    [handleAuthError],
  );

  const loadHistorico = useCallback(
    async ({ showRefreshing = false } = {}) => {
      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const result = await executeHistoricoRequest(currentQuery, requestId);

      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsQuerying(false);
      }

      return result;
    },
    [currentQuery, executeHistoricoRequest],
  );

  const refreshHistorico = useCallback(() => {
    return loadHistorico({
      showRefreshing: true,
    });
  }, [loadHistorico]);

  const updateAppliedQuery = useCallback(
    (nextQuery = {}) => {
      const normalizedNextQuery = buildFarmaciaHistoricoQuery({
        ...currentQuery,
        ...nextQuery,
      });

      const nextSearchParams =
        buildFarmaciaHistoricoSearchParams(normalizedNextQuery);

      if (nextSearchParams.toString() === searchParamsKey) {
        return false;
      }

      setError(null);
      setIsQuerying(true);

      setSearchParams(nextSearchParams, {
        replace: true,
      });

      return true;
    },
    [currentQuery, searchParamsKey, setSearchParams],
  );

  const updateStatus = useCallback(
    (status) => {
      setStatusInput(status);

      updateAppliedQuery({
        status,
        skip: 0,
      });
    },
    [updateAppliedQuery],
  );

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
    updateAppliedQuery({
      status: statusInput,
      search: searchInput,
      from: fromInput,
      to: toInput,
      skip: 0,
    });
  }, [fromInput, searchInput, statusInput, toInput, updateAppliedQuery]);

  const clearFilters = useCallback(() => {
    setStatusInput(DEFAULT_HISTORICO_QUERY.status);

    setSearchInput(DEFAULT_HISTORICO_QUERY.search);

    setFromInput(DEFAULT_HISTORICO_QUERY.from);

    setToInput(DEFAULT_HISTORICO_QUERY.to);

    updateAppliedQuery({
      ...DEFAULT_HISTORICO_QUERY,
    });
  }, [updateAppliedQuery]);

  const goToPreviousPage = useCallback(() => {
    if (!pagination.hasPreviousPage) {
      return;
    }

    updateAppliedQuery({
      skip: Math.max(0, currentQuery.skip - currentQuery.take),
    });
  }, [
    currentQuery.skip,
    currentQuery.take,
    pagination.hasPreviousPage,
    updateAppliedQuery,
  ]);

  const goToNextPage = useCallback(() => {
    if (!pagination.hasNextPage) {
      return;
    }

    updateAppliedQuery({
      skip: currentQuery.skip + currentQuery.take,
    });
  }, [
    currentQuery.skip,
    currentQuery.take,
    pagination.hasNextPage,
    updateAppliedQuery,
  ]);

  useEffect(() => {
    const requestId = latestRequestIdRef.current + 1;

    latestRequestIdRef.current = requestId;

    let isCancelled = false;

    async function loadCurrentQuery() {
      await executeHistoricoRequest(currentQuery, requestId);

      if (isCancelled || requestId !== latestRequestIdRef.current) {
        return;
      }

      setIsLoading(false);
      setIsRefreshing(false);
      setIsQuerying(false);
    }

    void loadCurrentQuery();

    return () => {
      isCancelled = true;

      if (latestRequestIdRef.current === requestId) {
        latestRequestIdRef.current += 1;
      }
    };
  }, [currentQuery, executeHistoricoRequest]);

  return {
    pedidos,
    meta,
    query: currentQuery,
    pagination,

    selectedStatus: currentQuery.status,

    statusInput,
    searchInput,
    fromInput,
    toInput,

    isLoading,
    isRefreshing,
    isQuerying,

    error,

    loadHistorico,
    refreshHistorico,

    updateStatus,
    updateSearchInput,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,

    goToPreviousPage,
    goToNextPage,
  };
}
