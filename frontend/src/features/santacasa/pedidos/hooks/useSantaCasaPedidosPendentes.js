import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { cancelPedido, getPedidosPendentes } from "../api/pedidosApi";

import { PEDIDOS_PAGE } from "../config/pedidosPage.config";

const DEFAULT_QUERY = Object.freeze({
  search: "",
  skip: 0,
  take: 50,
});

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

export function useSantaCasaPedidosPendentes() {
  const { handleAuthError } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [meta, setMeta] = useState(getInitialMeta);

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [searchInput, setSearchInput] = useState(DEFAULT_QUERY.search);

  const [pedidoToCancel, setPedidoToCancel] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const currentQuery = useMemo(() => query, [query]);
  const pedidoToCancelId = pedidoToCancel?.id;

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.take));
  const currentPage = Math.min(
    totalPages,
    Math.floor(meta.skip / meta.take) + 1,
  );

  const hasPreviousPage = meta.skip > 0;
  const hasNextPage = meta.skip + meta.take < meta.total;

  const loadPendentes = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await getPedidosPendentes(currentQuery);

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (handleAuthError(loadError)) return;

        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar os pedidos pendentes.",
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentQuery, handleAuthError],
  );

  const refreshPendentes = useCallback(async () => {
    await loadPendentes({ showRefreshing: true });
  }, [loadPendentes]);

  const updateSearchInput = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const applyFilters = useCallback(() => {
    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      search: searchInput,
      skip: 0,
    }));
  }, [searchInput]);

  const clearFilters = useCallback(() => {
    setSearchInput(DEFAULT_QUERY.search);
    setQuery({
      ...DEFAULT_QUERY,
    });
  }, []);

  const goToPreviousPage = useCallback(() => {
    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      skip: Math.max(
        0,
        Number(currentQueryValue.skip || 0) -
          Number(currentQueryValue.take || DEFAULT_QUERY.take),
      ),
    }));
  }, []);

  const goToNextPage = useCallback(() => {
    setQuery((currentQueryValue) => {
      const currentSkip = Number(currentQueryValue.skip || 0);
      const currentTake = Number(currentQueryValue.take || DEFAULT_QUERY.take);
      const nextSkip = currentSkip + currentTake;

      if (nextSkip >= meta.total) {
        return currentQueryValue;
      }

      return {
        ...currentQueryValue,
        skip: nextSkip,
      };
    });
  }, [meta.total]);

  const requestCancelPedido = useCallback((pedido) => {
    setPedidoToCancel(pedido);
  }, []);

  const cancelCancelPedido = useCallback(() => {
    if (isCanceling) return;

    setPedidoToCancel(null);
  }, [isCanceling]);

  const confirmCancelPedido = useCallback(async () => {
    if (!pedidoToCancelId) return;

    setIsCanceling(true);
    setFeedback(null);

    try {
      await cancelPedido(pedidoToCancelId, {
        reason: PEDIDOS_PAGE.cancelDialog.reason,
      });

      setPedidoToCancel(null);

      setFeedback({
        type: "success",
        message: PEDIDOS_PAGE.feedback.cancelSuccess,
      });

      await loadPendentes({ showRefreshing: true });
    } catch (cancelError) {
      if (handleAuthError(cancelError)) return;

      setFeedback({
        type: "error",
        message: getErrorMessage(
          cancelError,
          PEDIDOS_PAGE.feedback.genericError,
        ),
      });
    } finally {
      setIsCanceling(false);
    }
  }, [handleAuthError, loadPendentes, pedidoToCancelId]);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialPendentes() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPedidosPendentes(currentQuery);

        if (!isMounted) return;

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (!isMounted) return;
        if (handleAuthError(loadError)) return;

        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar os pedidos pendentes.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialPendentes();

    return () => {
      isMounted = false;
    };
  }, [currentQuery, handleAuthError]);

  return {
    pedidos,
    meta,
    query,

    searchInput,
    pedidoToCancel,

    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    isLoading,
    isRefreshing,
    isCanceling,

    error,
    feedback,

    loadPendentes,
    refreshPendentes,

    updateSearchInput,
    applyFilters,
    clearFilters,
    goToPreviousPage,
    goToNextPage,

    requestCancelPedido,
    cancelCancelPedido,
    confirmCancelPedido,

    clearFeedback,
  };
}
