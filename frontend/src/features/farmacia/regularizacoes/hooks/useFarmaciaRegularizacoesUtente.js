import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getFarmaciaRegularizacoesPendentes } from "../api/farmaciaRegularizacoesApi";

import { groupRegularizacoesByUtente } from "../utils/farmaciaRegularizacoes.utils";

const DEFAULT_QUERY = Object.freeze({
  skip: 0,
  take: 200,
});

const LOAD_ERROR_MESSAGE =
  "Não foi possível carregar as regularizações do utente.";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function useFarmaciaRegularizacoesUtente() {
  const { utenteId } = useParams();
  const { handleAuthError } = useAuth();

  const isMountedRef = useRef(false);

  const [regularizacoes, setRegularizacoes] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    skip: DEFAULT_QUERY.skip,
    take: DEFAULT_QUERY.take,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadRegularizacoes = useCallback(
    async ({ showRefreshing = false } = {}) => {
      if (!utenteId) {
        setError("Identificador do utente inválido.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await getFarmaciaRegularizacoesPendentes({
          ...DEFAULT_QUERY,
          utenteId,
        });

        if (!isMountedRef.current) return;

        setRegularizacoes(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        if (!isMountedRef.current) return;
        if (handleAuthError(loadError)) return;

        setError(getErrorMessage(loadError, LOAD_ERROR_MESSAGE));
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [handleAuthError, utenteId],
  );

  const refreshRegularizacoes = useCallback(async () => {
    await loadRegularizacoes({
      showRefreshing: true,
    });
  }, [loadRegularizacoes]);

  const group = useMemo(() => {
    const [utenteGroup] = groupRegularizacoesByUtente(regularizacoes);

    return utenteGroup || null;
  }, [regularizacoes]);

  const hasRegularizacoes = regularizacoes.length > 0;

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadRegularizacoes();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadRegularizacoes]);

  return {
    utenteId,
    regularizacoes,
    group,
    meta,

    hasRegularizacoes,

    isLoading,
    isRefreshing,
    error,

    refreshRegularizacoes,
  };
}
