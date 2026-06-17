// src/features/farmacia/pedidos/hooks/useFarmaciaPedidos.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getFarmaciaPedidos } from "../api/farmaciaPedidosApi";

const DEFAULT_QUERY = Object.freeze({
  status: "PENDENTE",
  search: "",
  skip: 0,
  take: 10,
});

const LOAD_ERROR_MESSAGE = "Não foi possível carregar os pedidos.";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getInitialQuery(initialQuery) {
  return {
    ...DEFAULT_QUERY,
    ...initialQuery,
  };
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

function getInitialMeta(initialQuery) {
  return getSafeMeta(null, initialQuery);
}

function getPagination(meta, pedidosCount) {
  const total = Number(meta?.total) || 0;
  const skip = Math.max(0, Number(meta?.skip) || 0);

  const take = Math.max(1, Number(meta?.take) || DEFAULT_QUERY.take);

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

export function useFarmaciaPedidos(initialQuery = DEFAULT_QUERY) {
  const { handleAuthError } = useAuth();

  const latestRequestIdRef = useRef(0);

  const [query, setQuery] = useState(() => getInitialQuery(initialQuery));

  const [pedidos, setPedidos] = useState([]);

  const [meta, setMeta] = useState(() => {
    const initialSafeQuery = getInitialQuery(initialQuery);

    return getInitialMeta(initialSafeQuery);
  });

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isQuerying, setIsQuerying] = useState(false);

  const [error, setError] = useState(null);

  const pagination = useMemo(() => {
    return getPagination(meta, pedidos.length);
  }, [meta, pedidos.length]);

  const executePedidosRequest = useCallback(
    async (requestQuery, requestId) => {
      try {
        const result = await getFarmaciaPedidos(requestQuery);

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

  const loadPedidos = useCallback(
    async ({ showRefreshing = false } = {}) => {
      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const result = await executePedidosRequest(query, requestId);

      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsQuerying(false);
      }

      return result;
    },
    [executePedidosRequest, query],
  );

  const refreshPedidos = useCallback(() => {
    return loadPedidos({
      showRefreshing: true,
    });
  }, [loadPedidos]);

  const updateQuery = useCallback((nextQuery = {}) => {
    setError(null);
    setIsQuerying(true);

    setQuery((currentQuery) => ({
      ...currentQuery,
      ...nextQuery,
    }));
  }, []);

  const searchPedidos = useCallback(
    (searchValue = "") => {
      updateQuery({
        search: String(searchValue).trim(),
        skip: 0,
      });
    },
    [updateQuery],
  );

  const clearSearch = useCallback(() => {
    updateQuery({
      search: "",
      skip: 0,
    });
  }, [updateQuery]);

  const goToPreviousPage = useCallback(() => {
    if (!pagination.hasPreviousPage) {
      return;
    }

    updateQuery({
      skip: Math.max(0, query.skip - query.take),
    });
  }, [pagination.hasPreviousPage, query.skip, query.take, updateQuery]);

  const goToNextPage = useCallback(() => {
    if (!pagination.hasNextPage) {
      return;
    }

    updateQuery({
      skip: query.skip + query.take,
    });
  }, [pagination.hasNextPage, query.skip, query.take, updateQuery]);

  useEffect(() => {
    const requestId = latestRequestIdRef.current + 1;

    latestRequestIdRef.current = requestId;

    let isCancelled = false;

    async function loadCurrentQuery() {
      await executePedidosRequest(query, requestId);

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
  }, [executePedidosRequest, query]);

  return {
    pedidos,
    meta,
    query,
    pagination,

    isLoading,
    isRefreshing,
    isQuerying,

    error,

    loadPedidos,
    refreshPedidos,
    updateQuery,

    searchPedidos,
    clearSearch,

    goToPreviousPage,
    goToNextPage,
  };
}
