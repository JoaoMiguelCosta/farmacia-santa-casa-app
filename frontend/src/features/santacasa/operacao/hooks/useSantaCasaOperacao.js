import { useEffect, useMemo, useState } from "react";

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

export function useSantaCasaOperacao() {
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

  async function loadOperationData(utenteId, { showRefreshing = false } = {}) {
    if (!utenteId) {
      setReceitas([]);
      setSemReceita([]);
      setExtras([]);
      return;
    }

    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoadingData(true);
    }

    setDataError(null);

    try {
      const [receitasData, semReceitaData, extrasData] = await Promise.all([
        getReceitasByUtente(utenteId),
        getSemReceitaByUtente(utenteId),
        getExtrasByUtente(utenteId),
      ]);

      setReceitas(sortReceitasByMedicamento(receitasData));
      setSemReceita(sortSemReceitaByMedicamento(semReceitaData));
      setExtras(sortExtrasByMedicamento(extrasData));
    } catch (error) {
      setDataError(
        getErrorMessage(error, "Erro ao carregar dados da operação."),
      );
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  }

  function handleSelectUtente(utenteId) {
    setSelectedUtenteId(utenteId);
    setDataError(null);

    loadOperationData(utenteId);
  }

  async function refreshOperationData() {
    await loadOperationData(selectedUtenteId, { showRefreshing: true });
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const utentesData = await getUtentes();

        if (!isMounted) return;

        const sortedUtentes = sortUtentesByName(utentesData);
        const firstUtenteId = sortedUtentes[0]?.id ?? "";

        setUtentes(sortedUtentes);
        setSelectedUtenteId(firstUtenteId);
        setUtentesError(null);

        if (!firstUtenteId) return;

        setIsLoadingData(true);

        const [receitasData, semReceitaData, extrasData] = await Promise.all([
          getReceitasByUtente(firstUtenteId),
          getSemReceitaByUtente(firstUtenteId),
          getExtrasByUtente(firstUtenteId),
        ]);

        if (!isMounted) return;

        setReceitas(sortReceitasByMedicamento(receitasData));
        setSemReceita(sortSemReceitaByMedicamento(semReceitaData));
        setExtras(sortExtrasByMedicamento(extrasData));
        setDataError(null);
      } catch (error) {
        if (!isMounted) return;

        setUtentesError(getErrorMessage(error, "Erro ao carregar utentes."));
      } finally {
        if (isMounted) {
          setIsLoadingUtentes(false);
          setIsLoadingData(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

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
