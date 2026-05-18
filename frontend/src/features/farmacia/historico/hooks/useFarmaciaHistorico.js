import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getFarmaciaHistorico } from "../api/farmaciaHistoricoApi";
import { buildFarmaciaHistoricoQuery } from "../utils/farmaciaHistorico.utils";

const DEFAULT_HISTORICO_QUERY = Object.freeze({
  status: "TODOS",
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 50,
});

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useFarmaciaHistorico(initialQuery = DEFAULT_HISTORICO_QUERY) {
  const { handleAuthError } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    skip: initialQuery.skip ?? DEFAULT_HISTORICO_QUERY.skip,
    take: initialQuery.take ?? DEFAULT_HISTORICO_QUERY.take,
  });

  const [query, setQuery] = useState({
    ...DEFAULT_HISTORICO_QUERY,
    ...initialQuery,
  });

  const [statusInput, setStatusInput] = useState(
    initialQuery.status ?? DEFAULT_HISTORICO_QUERY.status,
  );
  const [searchInput, setSearchInput] = useState(
    initialQuery.search ?? DEFAULT_HISTORICO_QUERY.search,
  );
  const [fromInput, setFromInput] = useState(
    initialQuery.from ?? DEFAULT_HISTORICO_QUERY.from,
  );
  const [toInput, setToInput] = useState(
    initialQuery.to ?? DEFAULT_HISTORICO_QUERY.to,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const hasPedidos = pedidos.length > 0;

  const currentQuery = useMemo(() => {
    return buildFarmaciaHistoricoQuery(query);
  }, [query]);

  const selectedStatus = useMemo(() => {
    return query.status || DEFAULT_HISTORICO_QUERY.status;
  }, [query.status]);

  const loadHistorico = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await getFarmaciaHistorico(currentQuery);

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (handleAuthError(loadError)) return;

        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar o histórico da Farmácia.",
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentQuery, handleAuthError],
  );

  const refreshHistorico = useCallback(async () => {
    await loadHistorico({ showRefreshing: true });
  }, [loadHistorico]);

  const updateStatus = useCallback((status) => {
    setStatusInput(status);

    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      status,
      skip: 0,
    }));
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
    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      status: statusInput,
      search: searchInput,
      from: fromInput,
      to: toInput,
      skip: 0,
    }));
  }, [fromInput, searchInput, statusInput, toInput]);

  const clearFilters = useCallback(() => {
    setStatusInput(DEFAULT_HISTORICO_QUERY.status);
    setSearchInput(DEFAULT_HISTORICO_QUERY.search);
    setFromInput(DEFAULT_HISTORICO_QUERY.from);
    setToInput(DEFAULT_HISTORICO_QUERY.to);

    setQuery(DEFAULT_HISTORICO_QUERY);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialHistorico() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getFarmaciaHistorico(currentQuery);

        if (!isMounted) return;

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (!isMounted) return;
        if (handleAuthError(loadError)) return;

        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar o histórico da Farmácia.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialHistorico();

    return () => {
      isMounted = false;
    };
  }, [currentQuery, handleAuthError]);

  return {
    pedidos,
    meta,
    query,
    selectedStatus,

    statusInput,
    searchInput,
    fromInput,
    toInput,

    hasPedidos,
    isLoading,
    isRefreshing,
    error,

    loadHistorico,
    refreshHistorico,
    updateStatus,

    updateSearchInput,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
  };
}
