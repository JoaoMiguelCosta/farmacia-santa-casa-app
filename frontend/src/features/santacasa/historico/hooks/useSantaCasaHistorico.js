import { useCallback, useEffect, useMemo, useState } from "react";

import { getSantaCasaHistorico } from "../api/santaCasaHistoricoApi";

import { buildSantaCasaHistoricoQuery } from "../utils/santaCasaHistorico.utils";

const DEFAULT_QUERY = Object.freeze({
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

export function useSantaCasaHistorico() {
  const [pedidos, setPedidos] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    skip: DEFAULT_QUERY.skip,
    take: DEFAULT_QUERY.take,
  });

  const [query, setQuery] = useState(DEFAULT_QUERY);

  const [statusInput, setStatusInput] = useState(DEFAULT_QUERY.status);
  const [searchInput, setSearchInput] = useState(DEFAULT_QUERY.search);
  const [fromInput, setFromInput] = useState(DEFAULT_QUERY.from);
  const [toInput, setToInput] = useState(DEFAULT_QUERY.to);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const hasPedidos = pedidos.length > 0;

  const currentQuery = useMemo(() => {
    return buildSantaCasaHistoricoQuery(query);
  }, [query]);

  const loadHistorico = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await getSantaCasaHistorico(currentQuery);

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar o histórico da Santa Casa.",
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentQuery],
  );

  const refreshHistorico = useCallback(async () => {
    await loadHistorico({ showRefreshing: true });
  }, [loadHistorico]);

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
    setStatusInput(DEFAULT_QUERY.status);
    setSearchInput(DEFAULT_QUERY.search);
    setFromInput(DEFAULT_QUERY.from);
    setToInput(DEFAULT_QUERY.to);

    setQuery(DEFAULT_QUERY);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialHistorico() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getSantaCasaHistorico(currentQuery);

        if (!isMounted) return;

        setPedidos(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (!isMounted) return;

        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar o histórico da Santa Casa.",
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
  }, [currentQuery]);

  return {
    pedidos,
    meta,
    query,

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

    updateStatusInput,
    updateSearchInput,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
  };
}
