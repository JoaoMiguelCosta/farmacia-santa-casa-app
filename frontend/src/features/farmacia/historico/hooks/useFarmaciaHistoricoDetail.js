// src/features/farmacia/historico/hooks/useFarmaciaHistoricoDetail.js
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getFarmaciaPedidoById } from "../../pedidos/api/farmaciaPedidosApi";

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

export function useFarmaciaHistoricoDetail(pedidoId) {
  const { handleAuthError } = useAuth();

  const latestRequestIdRef = useRef(0);

  const [state, setState] = useState(getInitialState);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPedido = useCallback(
    async (requestedPedidoId) => {
      if (!requestedPedidoId) return null;

      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      try {
        const pedido = await getFarmaciaPedidoById(requestedPedidoId);

        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        if (!pedido) {
          setState({
            pedido: null,
            loadedPedidoId: requestedPedidoId,
            error: LOAD_ERROR_MESSAGE,
          });

          return null;
        }

        setState({
          pedido,
          loadedPedidoId: requestedPedidoId,
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
          loadedPedidoId: requestedPedidoId,
          error: getErrorMessage(loadError, LOAD_ERROR_MESSAGE),
        });

        return null;
      }
    },
    [handleAuthError],
  );

  const refreshPedido = useCallback(async () => {
    if (!pedidoId) return null;

    setIsRefreshing(true);

    try {
      return await fetchPedido(pedidoId);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPedido, pedidoId]);

  useEffect(() => {
    if (!pedidoId) return undefined;

    let isEffectActive = true;

    queueMicrotask(() => {
      if (!isEffectActive) return;

      void fetchPedido(pedidoId);
    });

    return () => {
      isEffectActive = false;
      latestRequestIdRef.current += 1;
    };
  }, [fetchPedido, pedidoId]);

  const isLoading = Boolean(pedidoId) && state.loadedPedidoId !== pedidoId;

  return {
    pedido: state.pedido,
    error: state.error,

    isLoading,
    isRefreshing,

    refreshPedido,
  };
}
