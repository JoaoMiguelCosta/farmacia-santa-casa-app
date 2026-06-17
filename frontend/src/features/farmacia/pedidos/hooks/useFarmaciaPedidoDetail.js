// src/features/farmacia/pedidos/hooks/useFarmaciaPedidoDetail.js
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  getFarmaciaPedidoById,
  rejeitarFarmaciaPedido,
  validarFarmaciaPedido,
} from "../api/farmaciaPedidosApi";

import { buildRejectPedidoPayload } from "../../shared/pedidos/utils/farmaciaPedido.utils";

const LOAD_ERROR_MESSAGE = "Não foi possível carregar o pedido.";

const VALIDATE_ERROR_MESSAGE = "Não foi possível validar o pedido.";

const REJECT_ERROR_MESSAGE = "Não foi possível rejeitar o pedido.";

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

export function useFarmaciaPedidoDetail(pedidoId) {
  const { handleAuthError } = useAuth();

  const latestRequestIdRef = useRef(0);

  const [state, setState] = useState(getInitialState);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [validatingPedidoId, setValidatingPedidoId] = useState(null);
  const [rejectingPedidoId, setRejectingPedidoId] = useState(null);

  const [actionError, setActionError] = useState(null);

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

  const validatePedido = useCallback(
    async (requestedPedidoId) => {
      if (!requestedPedidoId) return null;

      setValidatingPedidoId(requestedPedidoId);
      setActionError(null);

      try {
        const updatedPedido = await validarFarmaciaPedido(requestedPedidoId);

        if (!updatedPedido) {
          return null;
        }

        latestRequestIdRef.current += 1;

        setState({
          pedido: updatedPedido,
          loadedPedidoId: requestedPedidoId,
          error: null,
        });

        return updatedPedido;
      } catch (validateError) {
        if (handleAuthError(validateError)) {
          return null;
        }

        setActionError(getErrorMessage(validateError, VALIDATE_ERROR_MESSAGE));

        return null;
      } finally {
        setValidatingPedidoId(null);
      }
    },
    [handleAuthError],
  );

  const rejectPedido = useCallback(
    async (requestedPedidoId, reason = "") => {
      if (!requestedPedidoId) return null;

      setRejectingPedidoId(requestedPedidoId);
      setActionError(null);

      try {
        const payload = buildRejectPedidoPayload(reason);

        const updatedPedido = await rejeitarFarmaciaPedido(
          requestedPedidoId,
          payload,
        );

        if (!updatedPedido) {
          return null;
        }

        latestRequestIdRef.current += 1;

        setState({
          pedido: updatedPedido,
          loadedPedidoId: requestedPedidoId,
          error: null,
        });

        return updatedPedido;
      } catch (rejectError) {
        if (handleAuthError(rejectError)) {
          return null;
        }

        setActionError(getErrorMessage(rejectError, REJECT_ERROR_MESSAGE));

        return null;
      } finally {
        setRejectingPedidoId(null);
      }
    },
    [handleAuthError],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

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

  const isActionRunning = Boolean(validatingPedidoId || rejectingPedidoId);

  return {
    pedido: state.pedido,

    error: state.error,
    actionError,

    isLoading,
    isRefreshing,
    isActionRunning,

    validatingPedidoId,
    rejectingPedidoId,

    refreshPedido,
    validatePedido,
    rejectPedido,
    clearActionError,
  };
}
