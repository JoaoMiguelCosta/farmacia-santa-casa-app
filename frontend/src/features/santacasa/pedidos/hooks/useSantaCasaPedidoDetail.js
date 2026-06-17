// src/features/santacasa/pedidos/hooks/useSantaCasaPedidoDetail.js

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { cancelPedido, getSantaCasaPedidoById } from "../api/pedidosApi";

const LOAD_ERROR_MESSAGE = "Não foi possível carregar o pedido.";

const CANCEL_ERROR_MESSAGE = "Não foi possível cancelar o pedido.";

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

function getUpdatedPedido(response) {
  if (response?.pedido) {
    return response.pedido;
  }

  if (response?.id) {
    return response;
  }

  return null;
}

export function useSantaCasaPedidoDetail(pedidoId) {
  const { handleAuthError } = useAuth();

  const latestRequestIdRef = useRef(0);

  const [state, setState] = useState(getInitialState);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isCanceling, setIsCanceling] = useState(false);

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
        const pedido = await getSantaCasaPedidoById(normalizedPedidoId);

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

  const cancelCurrentPedido = useCallback(
    async (reason = "") => {
      const normalizedPedidoId = String(pedidoId || "").trim();

      if (!normalizedPedidoId) {
        return {
          pedido: null,
          error: CANCEL_ERROR_MESSAGE,
        };
      }

      setIsCanceling(true);

      try {
        const response = await cancelPedido(normalizedPedidoId, {
          reason: String(reason || "").trim(),
        });

        let updatedPedido = getUpdatedPedido(response);

        if (updatedPedido) {
          latestRequestIdRef.current += 1;

          setState({
            pedido: updatedPedido,
            loadedPedidoId: normalizedPedidoId,
            error: null,
          });
        } else {
          updatedPedido = await fetchPedido(normalizedPedidoId);
        }

        if (!updatedPedido) {
          return {
            pedido: null,
            error: CANCEL_ERROR_MESSAGE,
          };
        }

        return {
          pedido: updatedPedido,
          error: null,
        };
      } catch (cancelError) {
        if (handleAuthError(cancelError)) {
          return {
            pedido: null,
            error: null,
          };
        }

        return {
          pedido: null,

          error: getErrorMessage(cancelError, CANCEL_ERROR_MESSAGE),
        };
      } finally {
        setIsCanceling(false);
      }
    },
    [fetchPedido, handleAuthError, pedidoId],
  );

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
    isCanceling,

    refreshPedido,
    cancelCurrentPedido,
  };
}
