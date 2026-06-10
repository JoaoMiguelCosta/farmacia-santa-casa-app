// src/features/santacasa/pedidos/hooks/useSantaCasaPedidosPendentes.js

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getPedidosPendentes } from "../api/pedidosApi";

import { PEDIDOS_PAGE } from "../config/pedidosPage.config";

import {
  buildSantaCasaPedidosSearchParams,
  getSantaCasaPedidosQueryFromSearchParams,
  SANTACASA_PEDIDOS_DEFAULT_QUERY,
} from "../utils/santaCasaPedidosQuery.utils";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getInitialMeta() {
  return {
    total: 0,
    skip: 0,
    take: SANTACASA_PEDIDOS_DEFAULT_QUERY.take,
  };
}

function getSafeMeta(meta) {
  const total = Number(meta?.total);
  const skip = Number(meta?.skip);
  const take = Number(meta?.take);

  return {
    total: Number.isFinite(total) && total >= 0 ? total : 0,

    skip: Number.isFinite(skip) && skip >= 0 ? skip : 0,

    take:
      Number.isFinite(take) && take > 0
        ? take
        : SANTACASA_PEDIDOS_DEFAULT_QUERY.take,
  };
}

export function useSantaCasaPedidosPendentes() {
  const { handleAuthError } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const isMountedRef = useRef(true);
  const latestRequestIdRef = useRef(0);

  const currentQuery = useMemo(() => {
    return getSantaCasaPedidosQueryFromSearchParams(searchParams);
  }, [searchParams]);

  const [pedidos, setPedidos] = useState([]);

  const [meta, setMeta] = useState(getInitialMeta);

  const [searchInput, setSearchInput] = useState(() => currentQuery.search);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const safeMeta = getSafeMeta(meta);

  const totalPages = Math.max(1, Math.ceil(safeMeta.total / safeMeta.take));

  const currentPage = Math.min(totalPages, currentQuery.page);

  const hasPreviousPage = currentQuery.page > 1;

  const hasNextPage = safeMeta.skip + safeMeta.take < safeMeta.total;

  const updateSearchParams = useCallback(
    ({ search, page, replace = false }) => {
      const nextSearchParams = buildSantaCasaPedidosSearchParams({
        currentSearchParams: searchParams,
        search,
        page,
      });

      setSearchParams(nextSearchParams, {
        replace,
      });
    },
    [searchParams, setSearchParams],
  );

  const loadPendentes = useCallback(
    async ({ showRefreshing = false } = {}) => {
      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await getPedidosPendentes(currentQuery);

        if (!isMountedRef.current || requestId !== latestRequestIdRef.current) {
          return;
        }

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (!isMountedRef.current || requestId !== latestRequestIdRef.current) {
          return;
        }

        if (handleAuthError(loadError)) {
          return;
        }

        setError(
          getErrorMessage(loadError, PEDIDOS_PAGE.sections.pending.errorTitle),
        );
      } finally {
        if (isMountedRef.current && requestId === latestRequestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [currentQuery, handleAuthError],
  );

  const refreshPendentes = useCallback(async () => {
    await loadPendentes({
      showRefreshing: true,
    });
  }, [loadPendentes]);

  const updateSearchInput = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const applyFilters = useCallback(() => {
    const normalizedSearch = String(searchInput || "").trim();

    const isSameQuery =
      normalizedSearch === currentQuery.search && currentQuery.page === 1;

    if (isSameQuery) {
      void loadPendentes({
        showRefreshing: true,
      });

      return;
    }

    updateSearchParams({
      search: normalizedSearch,
      page: 1,
    });
  }, [
    currentQuery.page,
    currentQuery.search,
    loadPendentes,
    searchInput,
    updateSearchParams,
  ]);

  const clearFilters = useCallback(() => {
    setSearchInput("");

    const isAlreadyClear =
      currentQuery.search === "" && currentQuery.page === 1;

    if (isAlreadyClear) {
      void loadPendentes({
        showRefreshing: true,
      });

      return;
    }

    updateSearchParams({
      search: "",
      page: 1,
    });
  }, [
    currentQuery.page,
    currentQuery.search,
    loadPendentes,
    updateSearchParams,
  ]);

  const goToPreviousPage = useCallback(() => {
    if (!hasPreviousPage) {
      return;
    }

    updateSearchParams({
      search: currentQuery.search,

      page: Math.max(1, currentQuery.page - 1),
    });
  }, [
    currentQuery.page,
    currentQuery.search,
    hasPreviousPage,
    updateSearchParams,
  ]);

  const goToNextPage = useCallback(() => {
    if (!hasNextPage) {
      return;
    }

    updateSearchParams({
      search: currentQuery.search,
      page: currentQuery.page + 1,
    });
  }, [currentQuery.page, currentQuery.search, hasNextPage, updateSearchParams]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      latestRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchInput(currentQuery.search);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentQuery.search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPendentes();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      latestRequestIdRef.current += 1;
    };
  }, [loadPendentes]);

  return {
    pedidos,
    meta,

    query: currentQuery,
    searchInput,

    currentPage,
    totalPages,

    hasPreviousPage,
    hasNextPage,

    isLoading,
    isRefreshing,

    error,

    loadPendentes,
    refreshPendentes,

    updateSearchInput,
    applyFilters,
    clearFilters,

    goToPreviousPage,
    goToNextPage,
  };
}
