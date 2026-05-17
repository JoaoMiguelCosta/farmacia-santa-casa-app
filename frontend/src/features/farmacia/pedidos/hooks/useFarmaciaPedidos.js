import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getFarmaciaPedidos,
  rejeitarFarmaciaPedido,
  validarFarmaciaPedido,
} from "../api/farmaciaPedidosApi";

import { buildRejectPedidoPayload } from "../../shared/pedidos/utils/farmaciaPedido.utils";

const DEFAULT_QUERY = Object.freeze({
  status: "PENDENTE",
  skip: 0,
  take: 50,
});

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useFarmaciaPedidos(initialQuery = DEFAULT_QUERY) {
  const [pedidos, setPedidos] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    skip: initialQuery.skip ?? DEFAULT_QUERY.skip,
    take: initialQuery.take ?? DEFAULT_QUERY.take,
  });

  const [query, setQuery] = useState({
    ...DEFAULT_QUERY,
    ...initialQuery,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [validatingPedidoId, setValidatingPedidoId] = useState(null);
  const [rejectingPedidoId, setRejectingPedidoId] = useState(null);

  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const hasPedidos = pedidos.length > 0;

  const isActionRunning = useMemo(() => {
    return Boolean(validatingPedidoId || rejectingPedidoId);
  }, [validatingPedidoId, rejectingPedidoId]);

  const loadPedidos = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await getFarmaciaPedidos(query);

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        setError(
          getErrorMessage(loadError, "Não foi possível carregar os pedidos."),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [query],
  );

  const refreshPedidos = useCallback(async () => {
    await loadPedidos({ showRefreshing: true });
  }, [loadPedidos]);

  const updateQuery = useCallback((nextQuery = {}) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      ...nextQuery,
    }));
  }, []);

  const validatePedido = useCallback(
    async (pedidoId) => {
      if (!pedidoId) return null;

      setValidatingPedidoId(pedidoId);
      setActionError(null);

      try {
        const updatedPedido = await validarFarmaciaPedido(pedidoId);

        await loadPedidos({ showRefreshing: true });

        return updatedPedido;
      } catch (validateError) {
        setActionError(
          getErrorMessage(validateError, "Não foi possível validar o pedido."),
        );

        return null;
      } finally {
        setValidatingPedidoId(null);
      }
    },
    [loadPedidos],
  );

  const rejectPedido = useCallback(
    async (pedidoId, reason = "") => {
      if (!pedidoId) return null;

      setRejectingPedidoId(pedidoId);
      setActionError(null);

      try {
        const payload = buildRejectPedidoPayload(reason);
        const updatedPedido = await rejeitarFarmaciaPedido(pedidoId, payload);

        await loadPedidos({ showRefreshing: true });

        return updatedPedido;
      } catch (rejectError) {
        setActionError(
          getErrorMessage(rejectError, "Não foi possível rejeitar o pedido."),
        );

        return null;
      } finally {
        setRejectingPedidoId(null);
      }
    },
    [loadPedidos],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialPedidos() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getFarmaciaPedidos(query);

        if (!isMounted) return;

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (!isMounted) return;

        setError(
          getErrorMessage(loadError, "Não foi possível carregar os pedidos."),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialPedidos();

    return () => {
      isMounted = false;
    };
  }, [query]);

  return {
    pedidos,
    meta,
    query,

    hasPedidos,
    isLoading,
    isRefreshing,
    isActionRunning,

    validatingPedidoId,
    rejectingPedidoId,

    error,
    actionError,

    loadPedidos,
    refreshPedidos,
    updateQuery,
    validatePedido,
    rejectPedido,
    clearActionError,
  };
}
