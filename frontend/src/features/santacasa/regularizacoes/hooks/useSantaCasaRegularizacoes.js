import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import {
  getSantaCasaRegularizacoesHistorico,
  getSantaCasaRegularizacoesPendentes,
  getSantaCasaRegularizacoesSignal,
} from "../api/santaCasaRegularizacoesApi";

import { getUtentes } from "../../utentes/api/utentesApi";
import { sortUtentesByName } from "../../utentes/utils/sortUtentes";

import { buildRegularizacoesQuery } from "../utils/santaCasaRegularizacoes.utils";

const TABS = Object.freeze({
  pending: "pending",
  history: "history",
});

const DEFAULT_QUERY = Object.freeze({
  search: "",
  utenteId: "",
  from: "",
  to: "",
  skip: 0,
  take: 50,
});

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getLoaderByTab(activeTab) {
  if (activeTab === TABS.history) {
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

  const [activeTab, setActiveTab] = useState(TABS.pending);

  const [regularizacoes, setRegularizacoes] = useState([]);
  const [meta, setMeta] = useState(getInitialMeta);

  const [signal, setSignal] = useState(null);
  const [utentes, setUtentes] = useState([]);

  const [query, setQuery] = useState(DEFAULT_QUERY);

  const [searchInput, setSearchInput] = useState("");
  const [selectedUtenteId, setSelectedUtenteId] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingSignal, setIsLoadingSignal] = useState(true);
  const [isLoadingUtentes, setIsLoadingUtentes] = useState(true);

  const [error, setError] = useState(null);
  const [signalError, setSignalError] = useState(null);
  const [utentesError, setUtentesError] = useState(null);

  const hasRegularizacoes = regularizacoes.length > 0;

  const currentQuery = useMemo(() => {
    return buildRegularizacoesQuery(query);
  }, [query]);

  const selectedUtente = useMemo(() => {
    return utentes.find((utente) => utente.id === selectedUtenteId) ?? null;
  }, [utentes, selectedUtenteId]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.take));
  const currentPage = Math.min(
    totalPages,
    Math.floor(meta.skip / meta.take) + 1,
  );

  const hasPreviousPage = meta.skip > 0;
  const hasNextPage = meta.skip + meta.take < meta.total;

  const loadUtentes = useCallback(async () => {
    setIsLoadingUtentes(true);
    setUtentesError(null);

    try {
      const data = await getUtentes({
        status: "TODOS",
        skip: 0,
        take: 100,
      });

      setUtentes(sortUtentesByName(data));
    } catch (utentesLoadError) {
      if (handleAuthError(utentesLoadError)) return;

      setUtentesError(
        getErrorMessage(utentesLoadError, "Não foi possível carregar utentes."),
      );
    } finally {
      setIsLoadingUtentes(false);
    }
  }, [handleAuthError]);

  const loadSignal = useCallback(async () => {
    setIsLoadingSignal(true);
    setSignalError(null);

    try {
      const data = await getSantaCasaRegularizacoesSignal();

      setSignal(data);
    } catch (signalLoadError) {
      if (handleAuthError(signalLoadError)) return;

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
        if (handleAuthError(loadError)) return;

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
      loadRegularizacoes({ showRefreshing: true }),
      loadSignal(),
      loadUtentes(),
    ]);
  }, [loadRegularizacoes, loadSignal, loadUtentes]);

  const updateTab = useCallback((nextTab) => {
    if (!Object.values(TABS).includes(nextTab)) return;

    setActiveTab(nextTab);
    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      skip: 0,
    }));
  }, []);

  const updateSearchInput = useCallback((value) => {
    setSearchInput(value);
  }, []);

  const updateSelectedUtenteId = useCallback((utenteId) => {
    setSelectedUtenteId(utenteId);
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
      utenteId: selectedUtenteId,
      from: fromInput,
      to: toInput,
      skip: 0,
    }));
  }, [fromInput, searchInput, selectedUtenteId, toInput]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSelectedUtenteId("");
    setFromInput("");
    setToInput("");

    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      search: "",
      utenteId: "",
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

    async function loadInitialUtentes() {
      setIsLoadingUtentes(true);
      setUtentesError(null);

      try {
        const data = await getUtentes({
          status: "TODOS",
          skip: 0,
          take: 100,
        });

        if (!isMounted) return;

        setUtentes(sortUtentesByName(data));
      } catch (utentesLoadError) {
        if (!isMounted) return;
        if (handleAuthError(utentesLoadError)) return;

        setUtentesError(
          getErrorMessage(
            utentesLoadError,
            "Não foi possível carregar utentes.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoadingUtentes(false);
        }
      }
    }

    loadInitialUtentes();

    return () => {
      isMounted = false;
    };
  }, [handleAuthError]);

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
        if (handleAuthError(signalLoadError)) return;

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
        if (handleAuthError(loadError)) return;

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
  }, [activeTab, currentQuery, handleAuthError]);

  return {
    tabs: TABS,

    activeTab,
    regularizacoes,
    meta,
    signal,

    utentes,
    selectedUtente,
    selectedUtenteId,

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
    isLoadingUtentes,

    error,
    signalError,
    utentesError,

    loadRegularizacoes,
    loadSignal,
    loadUtentes,
    refreshRegularizacoes,

    updateTab,
    updateSearchInput,
    updateSelectedUtenteId,
    updateFromInput,
    updateToInput,

    applyFilters,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  };
}
