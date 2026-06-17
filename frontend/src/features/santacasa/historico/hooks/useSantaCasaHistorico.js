// src/features/santacasa/historico/hooks/useSantaCasaHistorico.js

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getSantaCasaHistorico } from "../api/santaCasaHistoricoApi";

import {
  buildSantaCasaHistoricoRequestQuery,
  buildSantaCasaHistoricoSearchParams,
  getSantaCasaHistoricoQueryFromSearchParams,
  SANTACASA_HISTORICO_DEFAULT_QUERY,
} from "../utils/santaCasaHistoricoQuery.utils";

const LOAD_ERROR_MESSAGE =
  "Não foi possível carregar o histórico da Santa Casa.";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getInitialMeta() {
  return {
    total: 0,
    skip: 0,

    take: SANTACASA_HISTORICO_DEFAULT_QUERY.take,
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
        : SANTACASA_HISTORICO_DEFAULT_QUERY.take,
  };
}

export function useSantaCasaHistorico() {
  const { handleAuthError } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const latestRequestIdRef = useRef(0);

  const urlQuery = useMemo(() => {
    return getSantaCasaHistoricoQueryFromSearchParams(searchParams);
  }, [searchParams]);

  const requestQuery = useMemo(() => {
    return buildSantaCasaHistoricoRequestQuery(urlQuery);
  }, [urlQuery]);

  const [pedidos, setPedidos] = useState([]);

  const [meta, setMeta] = useState(getInitialMeta);

  const [statusInput, setStatusInput] = useState(() => urlQuery.status);

  const [searchInput, setSearchInput] = useState(() => urlQuery.search);

  const [fromInput, setFromInput] = useState(() => urlQuery.from);

  const [toInput, setToInput] = useState(() => urlQuery.to);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const safeMeta = getSafeMeta(meta);

  const totalPages = Math.max(1, Math.ceil(safeMeta.total / safeMeta.take));

  const currentPage = Math.min(totalPages, urlQuery.page);

  const hasPreviousPage = urlQuery.page > 1;

  const hasNextPage = safeMeta.skip + safeMeta.take < safeMeta.total;

  const updateSearchParams = useCallback(
    ({ status, search, from, to, page, replace = false }) => {
      const nextSearchParams = buildSantaCasaHistoricoSearchParams({
        currentSearchParams: searchParams,

        status,
        search,
        from,
        to,
        page,
      });

      setSearchParams(nextSearchParams, {
        replace,
      });
    },
    [searchParams, setSearchParams],
  );

  const executeHistoricoRequest = useCallback(
    async ({ query, mode = "loading" }) => {
      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      if (mode === "refreshing") {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await getSantaCasaHistorico(query);

        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        setPedidos(result.data);
        setMeta(result.meta);

        return result;
      } catch (requestError) {
        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        if (handleAuthError(requestError)) {
          return null;
        }

        setError(getErrorMessage(requestError, LOAD_ERROR_MESSAGE));

        return null;
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [handleAuthError],
  );

  const refreshHistorico = useCallback(async () => {
    return executeHistoricoRequest({
      query: requestQuery,
      mode: "refreshing",
    });
  }, [executeHistoricoRequest, requestQuery]);

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
    const normalizedSearch = String(searchInput || "").trim();

    const isSameQuery =
      statusInput === urlQuery.status &&
      normalizedSearch === urlQuery.search &&
      fromInput === urlQuery.from &&
      toInput === urlQuery.to &&
      urlQuery.page === 1;

    if (isSameQuery) {
      void refreshHistorico();
      return;
    }

    updateSearchParams({
      status: statusInput,
      search: normalizedSearch,
      from: fromInput,
      to: toInput,
      page: 1,
    });
  }, [
    fromInput,
    refreshHistorico,
    searchInput,
    statusInput,
    toInput,
    updateSearchParams,
    urlQuery.from,
    urlQuery.page,
    urlQuery.search,
    urlQuery.status,
    urlQuery.to,
  ]);

  const clearFilters = useCallback(() => {
    const defaultQuery = SANTACASA_HISTORICO_DEFAULT_QUERY;

    setStatusInput(defaultQuery.status);
    setSearchInput(defaultQuery.search);
    setFromInput(defaultQuery.from);
    setToInput(defaultQuery.to);

    const isAlreadyClear =
      urlQuery.status === defaultQuery.status &&
      urlQuery.search === defaultQuery.search &&
      urlQuery.from === defaultQuery.from &&
      urlQuery.to === defaultQuery.to &&
      urlQuery.page === defaultQuery.page;

    if (isAlreadyClear) {
      void refreshHistorico();
      return;
    }

    updateSearchParams({
      status: defaultQuery.status,
      search: defaultQuery.search,
      from: defaultQuery.from,
      to: defaultQuery.to,
      page: defaultQuery.page,
    });
  }, [
    refreshHistorico,
    updateSearchParams,
    urlQuery.from,
    urlQuery.page,
    urlQuery.search,
    urlQuery.status,
    urlQuery.to,
  ]);

  const goToPreviousPage = useCallback(() => {
    if (!hasPreviousPage) {
      return;
    }

    updateSearchParams({
      status: urlQuery.status,
      search: urlQuery.search,
      from: urlQuery.from,
      to: urlQuery.to,

      page: Math.max(1, urlQuery.page - 1),
    });
  }, [
    hasPreviousPage,
    updateSearchParams,
    urlQuery.from,
    urlQuery.page,
    urlQuery.search,
    urlQuery.status,
    urlQuery.to,
  ]);

  const goToNextPage = useCallback(() => {
    if (!hasNextPage) {
      return;
    }

    updateSearchParams({
      status: urlQuery.status,
      search: urlQuery.search,
      from: urlQuery.from,
      to: urlQuery.to,
      page: urlQuery.page + 1,
    });
  }, [
    hasNextPage,
    updateSearchParams,
    urlQuery.from,
    urlQuery.page,
    urlQuery.search,
    urlQuery.status,
    urlQuery.to,
  ]);

  useEffect(() => {
    let isCancelled = false;

    queueMicrotask(() => {
      if (isCancelled) {
        return;
      }

      setStatusInput(urlQuery.status);
      setSearchInput(urlQuery.search);
      setFromInput(urlQuery.from);
      setToInput(urlQuery.to);
    });

    return () => {
      isCancelled = true;
    };
  }, [urlQuery.from, urlQuery.search, urlQuery.status, urlQuery.to]);

  useEffect(() => {
    let isCancelled = false;

    queueMicrotask(() => {
      if (isCancelled) {
        return;
      }

      void executeHistoricoRequest({
        query: requestQuery,
        mode: "loading",
      });
    });

    return () => {
      isCancelled = true;
      latestRequestIdRef.current += 1;
    };
  }, [executeHistoricoRequest, requestQuery]);

  return {
    pedidos,
    meta,

    query: urlQuery,

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
