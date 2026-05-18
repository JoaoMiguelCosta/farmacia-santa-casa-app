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
  medicamento: "",
  utenteId: "",
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

export function useSantaCasaRegularizacoes() {
  const { handleAuthError } = useAuth();

  const [activeTab, setActiveTab] = useState(TABS.pending);

  const [regularizacoes, setRegularizacoes] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    skip: DEFAULT_QUERY.skip,
    take: DEFAULT_QUERY.take,
  });

  const [signal, setSignal] = useState(null);
  const [utentes, setUtentes] = useState([]);

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [medicamentoInput, setMedicamentoInput] = useState("");
  const [selectedUtenteId, setSelectedUtenteId] = useState("");

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

  const loadUtentes = useCallback(async () => {
    setIsLoadingUtentes(true);
    setUtentesError(null);

    try {
      const data = await getUtentes();

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

  const updateMedicamentoInput = useCallback((value) => {
    setMedicamentoInput(value);
  }, []);

  const updateSelectedUtenteId = useCallback((utenteId) => {
    setSelectedUtenteId(utenteId);
  }, []);

  const applyFilters = useCallback(() => {
    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      medicamento: medicamentoInput,
      utenteId: selectedUtenteId,
      skip: 0,
    }));
  }, [medicamentoInput, selectedUtenteId]);

  const clearFilters = useCallback(() => {
    setMedicamentoInput("");
    setSelectedUtenteId("");

    setQuery((currentQueryValue) => ({
      ...currentQueryValue,
      medicamento: "",
      utenteId: "",
      skip: 0,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUtentes() {
      setIsLoadingUtentes(true);
      setUtentesError(null);

      try {
        const data = await getUtentes();

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
    medicamentoInput,

    hasRegularizacoes,

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
    updateMedicamentoInput,
    updateSelectedUtenteId,
    applyFilters,
    clearFilters,
  };
}
