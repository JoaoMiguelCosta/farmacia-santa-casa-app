import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../../../../auth/hooks/useAuth";

import { getSantaCasaHistoricoPedidoById } from "../../api/santaCasaHistoricoApi";
const LOAD_ERROR_MESSAGE = "Não foi possível carregar o pedido do histórico.";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getInitialState() {
  return {
    pedido: null,
    loadedPedidoId: null,
    error: null,
  };
}

export function useSantaCasaHistoricoDetail(pedidoId) {
  const { handleAuthError } = useAuth();

  const latestRequestIdRef = useRef(0);

  const [state, setState] = useState(getInitialState);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPedido = useCallback(
    async (requestedPedidoId) => {
      const normalizedPedidoId = String(requestedPedidoId || "").trim();

      if (!normalizedPedidoId) {
        setState({
          pedido: null,
          loadedPedidoId: normalizedPedidoId,
          error: LOAD_ERROR_MESSAGE,
        });

        return null;
      }

      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      try {
        const pedido =
          await getSantaCasaHistoricoPedidoById(normalizedPedidoId);

        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        if (!pedido) {
          setState({
            pedido: null,
            loadedPedidoId: normalizedPedidoId,
            error: LOAD_ERROR_MESSAGE,
          });

          return null;
        }

        setState({
          pedido,
          loadedPedidoId: normalizedPedidoId,
          error: null,
        });

        return pedido;
      } catch (loadError) {
        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        if (handleAuthError(loadError)) {
          return null;
        }

        setState({
          pedido: null,
          loadedPedidoId: normalizedPedidoId,
          error: getErrorMessage(loadError, LOAD_ERROR_MESSAGE),
        });

        return null;
      }
    },
    [handleAuthError],
  );

  const refreshPedido = useCallback(async () => {
    if (!pedidoId) {
      return null;
    }

    setIsRefreshing(true);

    try {
      return await fetchPedido(pedidoId);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPedido, pedidoId]);

  useEffect(() => {
    if (!pedidoId) {
      return undefined;
    }

    let isEffectActive = true;

    queueMicrotask(() => {
      if (!isEffectActive) {
        return;
      }

      void fetchPedido(pedidoId);
    });

    return () => {
      isEffectActive = false;
      latestRequestIdRef.current += 1;
    };
  }, [fetchPedido, pedidoId]);

  const normalizedPedidoId = String(pedidoId || "").trim();

  const isLoading =
    Boolean(normalizedPedidoId) && state.loadedPedidoId !== normalizedPedidoId;

  return {
    pedido: state.pedido,
    error: state.error,

    isLoading,
    isRefreshing,

    refreshPedido,
  };
}
