import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getFarmaciaRegularizacoesHistorico,
  getFarmaciaRegularizacoesPendentes,
  getFarmaciaRegularizacoesSignal,
} from "../api/farmaciaRegularizacoesApi";

import { buildRegularizacoesQuery } from "../utils/farmaciaRegularizacoes.utils";

const TABS = Object.freeze({
  pending: "pending",
  history: "history",
});

const DEFAULT_QUERY = Object.freeze({
  medicamento: "",
  skip: 0,
  take: 50,
});

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getLoaderByTab(activeTab) {
  if (activeTab === TABS.history) {
    return getFarmaciaRegularizacoesHistorico;
  }

  return getFarmaciaRegularizacoesPendentes;
}

export function useFarmaciaRegularizacoes() {
  const [activeTab, setActiveTab] = useState(TABS.pending);

  const [regularizacoes, setRegularizacoes] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    skip: DEFAULT_QUERY.skip,
    take: DEFAULT_QUERY.take,
  });

  const [signal, setSignal] = useState(null);

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [medicamentoInput, setMedicamentoInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingSignal, setIsLoadingSignal] = useState(true);

  const [error, setError] = useState(null);
  const [signalError, setSignalError] = useState(null);

  const hasRegularizacoes = regularizacoes.length > 0;

  const currentQuery = useMemo(() => {
    return buildRegularizacoesQuery(query);
  }, [query]);

  const loadSignal = useCallback(async () => {
    setIsLoadingSignal(true);
    setSignalError(null);

    try {
      const data = await getFarmaciaRegularizacoesSignal();

      setSignal(data);
    } catch (signalLoadError) {
      setSignalError(
        getErrorMessage(signalLoadError, "Não foi possível carregar o resumo."),
      );
    } finally {
      setIsLoadingSignal(false);
    }
  }, []);

  const loadRegularizacoes = useCallback(
    async ({ showRefreshing = false } = {}) => {
      const loader = getLoaderByTab(activeTab);

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await loader(currentQuery);

        setRegularizacoes(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar as regularizações.",
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab, currentQuery],
  );

  const refreshRegularizacoes = useCallback(async () => {
    await Promise.all([
      loadRegularizacoes({ showRefreshing: true }),
      loadSignal(),
    ]);
  }, [loadRegularizacoes, loadSignal]);

  const updateTab = useCallback((nextTab) => {
    if (!Object.values(TABS).includes(nextTab)) return;

    setActiveTab(nextTab);
    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      skip: 0,
    }));
  }, []);

  const updateMedicamentoInput = useCallback((value) => {
    setMedicamentoInput(value);
  }, []);

  const applyFilters = useCallback(() => {
    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      medicamento: medicamentoInput,
      skip: 0,
    }));
  }, [medicamentoInput]);

  const clearFilters = useCallback(() => {
    setMedicamentoInput("");
    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      medicamento: "",
      skip: 0,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSignal() {
      setIsLoadingSignal(true);
      setSignalError(null);

      try {
        const data = await getFarmaciaRegularizacoesSignal();

        if (!isMounted) return;

        setSignal(data);
      } catch (signalLoadError) {
        if (!isMounted) return;

        setSignalError(
          getErrorMessage(
            signalLoadError,
            "Não foi possível carregar o resumo.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoadingSignal(false);
        }
      }
    }

    loadInitialSignal();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialRegularizacoes() {
      const loader = getLoaderByTab(activeTab);

      setIsLoading(true);
      setError(null);

      try {
        const result = await loader(currentQuery);

        if (!isMounted) return;

        setRegularizacoes(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (!isMounted) return;

        setError(
          getErrorMessage(
            loadError,
            "Não foi possível carregar as regularizações.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialRegularizacoes();

    return () => {
      isMounted = false;
    };
  }, [activeTab, currentQuery]);

  return {
    tabs: TABS,

    activeTab,
    regularizacoes,
    meta,
    signal,
    query,
    medicamentoInput,

    hasRegularizacoes,
    isLoading,
    isRefreshing,
    isLoadingSignal,

    error,
    signalError,

    loadRegularizacoes,
    loadSignal,
    refreshRegularizacoes,
    updateTab,
    updateMedicamentoInput,
    applyFilters,
    clearFilters,
  };
}
