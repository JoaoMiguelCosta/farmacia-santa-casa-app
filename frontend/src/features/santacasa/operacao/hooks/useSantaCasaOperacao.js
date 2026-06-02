// src/features/santacasa/operacao/hooks/useSantaCasaOperacao.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getUtentes } from "../../utentes/api/utentesApi";
import { sortUtentesByName } from "../../utentes/utils/sortUtentes";

import { getReceitasByUtente } from "../../receitas/api/receitasApi";
import { sortReceitasByMedicamento } from "../../receitas/utils/sortReceitas";

import { getSemReceitaByUtente } from "../../sem-receita/api/semReceitaApi";
import { sortSemReceitaByMedicamento } from "../../sem-receita/utils/sortSemReceita";

import { getExtrasByUtente } from "../../extras/api/extrasApi";
import { sortExtrasByMedicamento } from "../../extras/utils/sortExtras";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

async function getOperationDataByUtente(utenteId) {
  const [receitasData, semReceitaData, extrasData] = await Promise.all([
    getReceitasByUtente(utenteId),
    getSemReceitaByUtente(utenteId),
    getExtrasByUtente(utenteId),
  ]);

  return {
    receitas: sortReceitasByMedicamento(receitasData),
    semReceita: sortSemReceitaByMedicamento(semReceitaData),
    extras: sortExtrasByMedicamento(extrasData),
  };
}

export function useSantaCasaOperacao() {
  const { handleAuthError } = useAuth();

  const isMountedRef = useRef(true);
  const operationRequestIdRef = useRef(0);

  const [utentes, setUtentes] = useState([]);
  const [selectedUtenteId, setSelectedUtenteId] = useState("");

  const [receitas, setReceitas] = useState([]);
  const [semReceita, setSemReceita] = useState([]);
  const [extras, setExtras] = useState([]);

  const [isLoadingUtentes, setIsLoadingUtentes] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [utentesError, setUtentesError] = useState(null);
  const [dataError, setDataError] = useState(null);

  const selectedUtente = useMemo(
    () => utentes.find((utente) => utente.id === selectedUtenteId) ?? null,
    [utentes, selectedUtenteId],
  );

  const clearOperationData = useCallback(() => {
    setReceitas([]);
    setSemReceita([]);
    setExtras([]);
  }, []);

  const loadOperationData = useCallback(
    async (utenteId, { showRefreshing = false } = {}) => {
      operationRequestIdRef.current += 1;

      const requestId = operationRequestIdRef.current;

      if (!utenteId) {
        clearOperationData();
        setDataError(null);
        setIsLoadingData(false);
        setIsRefreshing(false);
        return;
      }

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoadingData(true);
      }

      setDataError(null);

      try {
        const operationData = await getOperationDataByUtente(utenteId);

        if (
          !isMountedRef.current ||
          requestId !== operationRequestIdRef.current
        ) {
          return;
        }

        setReceitas(operationData.receitas);
        setSemReceita(operationData.semReceita);
        setExtras(operationData.extras);
      } catch (error) {
        if (
          !isMountedRef.current ||
          requestId !== operationRequestIdRef.current
        ) {
          return;
        }

        if (handleAuthError(error)) return;

        setDataError(
          getErrorMessage(error, "Erro ao carregar dados da operação."),
        );
      } finally {
        if (
          isMountedRef.current &&
          requestId === operationRequestIdRef.current
        ) {
          setIsLoadingData(false);
          setIsRefreshing(false);
        }
      }
    },
    [clearOperationData, handleAuthError],
  );

  const handleSelectUtente = useCallback(
    (utenteId) => {
      setSelectedUtenteId(utenteId);
      setDataError(null);

      loadOperationData(utenteId);
    },
    [loadOperationData],
  );

  const refreshOperationData = useCallback(async () => {
    await loadOperationData(selectedUtenteId, { showRefreshing: true });
  }, [loadOperationData, selectedUtenteId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      operationRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadInitialData() {
      setIsLoadingUtentes(true);
      setUtentesError(null);

      try {
        const utentesData = await getUtentes();

        if (shouldIgnore || !isMountedRef.current) return;

        const sortedUtentes = sortUtentesByName(utentesData);
        const firstUtenteId = sortedUtentes[0]?.id ?? "";

        setUtentes(sortedUtentes);
        setSelectedUtenteId(firstUtenteId);
        setUtentesError(null);

        await loadOperationData(firstUtenteId);
      } catch (error) {
        if (shouldIgnore || !isMountedRef.current) return;
        if (handleAuthError(error)) return;

        setUtentesError(getErrorMessage(error, "Erro ao carregar utentes."));
      } finally {
        if (!shouldIgnore && isMountedRef.current) {
          setIsLoadingUtentes(false);
        }
      }
    }

    loadInitialData();

    return () => {
      shouldIgnore = true;
    };
  }, [handleAuthError, loadOperationData]);

  return {
    utentes,
    selectedUtenteId,
    selectedUtente,

    receitas,
    semReceita,
    extras,

    isLoadingUtentes,
    isLoadingData,
    isRefreshing,

    utentesError,
    dataError,

    handleSelectUtente,
    refreshOperationData,
  };
}
