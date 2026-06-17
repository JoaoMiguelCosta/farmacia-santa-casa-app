import { useCallback, useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  getSantaCasaRegularizacoesHistorico,
  getSantaCasaRegularizacoesPendentes,
  getSantaCasaRegularizacoesSignal,
} from "../api/santaCasaRegularizacoesApi";

import {
  SANTACASA_REGULARIZACOES_TABS,
  buildRegularizacoesQuery,
  buildRegularizacoesViewSearchParams,
  getRegularizacoesViewFromSearchParams,
} from "../utils/santaCasaRegularizacoes.utils";

const DEFAULT_QUERY = Object.freeze({
  search: "",
  from: "",
  to: "",
  skip: 0,
  take: 50,
});

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getLoaderByTab(activeTab) {
  if (activeTab === SANTACASA_REGULARIZACOES_TABS.history) {
    return getSantaCasaRegularizacoesHistorico;
  }

  return getSantaCasaRegularizacoesPendentes;
}

function getInitialMeta() {
  return {
    total: 0,
    skip: DEFAULT_QUERY.skip,
    take: DEFAULT_QUERY.take,
  };
}

export function useSantaCasaRegularizacoes() {
  const { handleAuthError } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [regularizacoes, setRegularizacoes] = useState([]);

  const [meta, setMeta] = useState(getInitialMeta);

  const [signal, setSignal] = useState(null);
  const [query, setQuery] = useState(DEFAULT_QUERY);

  const [searchInput, setSearchInput] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isLoadingSignal, setIsLoadingSignal] = useState(true);

  const [error, setError] = useState(null);

  const [signalError, setSignalError] = useState(null);

  const activeTab = useMemo(() => {
    return getRegularizacoesViewFromSearchParams(searchParams);
  }, [searchParams]);

  const hasRegularizacoes = regularizacoes.length > 0;

  const currentQuery = useMemo(() => {
    return buildRegularizacoesQuery(query);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.take));

  const currentPage = Math.min(
    totalPages,
    Math.floor(meta.skip / meta.take) + 1,
  );

  const hasPreviousPage = meta.skip > 0;

  const hasNextPage = meta.skip + meta.take < meta.total;

  const loadSignal = useCallback(async () => {
    setIsLoadingSignal(true);
    setSignalError(null);

    try {
      const data = await getSantaCasaRegularizacoesSignal();

      setSignal(data);
    } catch (signalLoadError) {
      if (handleAuthError(signalLoadError)) {
        return;
      }

      setSignalError(
        getErrorMessage(signalLoadError, "Não foi possível carregar o resumo."),
      );
    } finally {
      setIsLoadingSignal(false);
    }
  }, [handleAuthError]);

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
        if (handleAuthError(loadError)) {
          return;
        }

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
    [activeTab, currentQuery, handleAuthError],
  );

  const refreshRegularizacoes = useCallback(async () => {
    await Promise.all([
      loadRegularizacoes({
        showRefreshing: true,
      }),
      loadSignal(),
    ]);
  }, [loadRegularizacoes, loadSignal]);

  const updateTab = useCallback(
    (nextTab) => {
      if (!Object.values(SANTACASA_REGULARIZACOES_TABS).includes(nextTab)) {
        return;
      }

      if (nextTab === activeTab) {
        return;
      }

      const nextSearchParams = buildRegularizacoesViewSearchParams({
        currentSearchParams: searchParams,
        view: nextTab,
      });

      setSearchParams(nextSearchParams);

      setQuery((currentQueryValue) => ({
        ...currentQueryValue,
        skip: 0,
      }));
    },
    [activeTab, searchParams, setSearchParams],
  );

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
      search: searchInput,
      from: fromInput,
      to: toInput,
      skip: 0,
    }));
  }, [fromInput, searchInput, toInput]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setFromInput("");
    setToInput("");

    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      search: "",
      from: "",
      to: "",
      skip: 0,
    }));
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

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSignal() {
      setIsLoadingSignal(true);
      setSignalError(null);

      try {
        const data = await getSantaCasaRegularizacoesSignal();

        if (!isMounted) return;

        setSignal(data);
      } catch (signalLoadError) {
        if (!isMounted) return;

        if (handleAuthError(signalLoadError)) {
          return;
        }

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

    void loadInitialSignal();

    return () => {
      isMounted = false;
    };
  }, [handleAuthError]);

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

        if (handleAuthError(loadError)) {
          return;
        }

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

    void loadInitialRegularizacoes();

    return () => {
      isMounted = false;
    };
  }, [activeTab, currentQuery, handleAuthError]);

  return {
    tabs: SANTACASA_REGULARIZACOES_TABS,

    activeTab,
    regularizacoes,
    meta,
    signal,
    query,

    searchInput,
    fromInput,
    toInput,

    hasRegularizacoes,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,

    isLoading,
    isRefreshing,
    isLoadingSignal,

    error,
    signalError,

    loadRegularizacoes,
    loadSignal,
    refreshRegularizacoes,

    updateTab,
    updateSearchInput,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  };
}
