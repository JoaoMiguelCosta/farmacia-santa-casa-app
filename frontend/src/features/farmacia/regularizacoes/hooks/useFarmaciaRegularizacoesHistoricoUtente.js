import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuth } from "../../../auth/hooks/useAuth";

import { getFarmaciaRegularizacoesHistorico } from "../api/farmaciaRegularizacoesApi";

import {
  getRegularizacaoEventos,
  getRegularizacaoQuantidadeRegularizada,
} from "../utils/farmaciaRegularizacoes.utils";

import { formatDateTime } from "../../../../shared/utils/formatDate";

const DEFAULT_QUERY = Object.freeze({
  skip: 0,
  take: 200,
});

const UNKNOWN_LABEL = "—";

const LOAD_ERROR_MESSAGE = "Não foi possível carregar o histórico do utente.";

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getSafeDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getDateTimestamp(value) {
  const date = getSafeDate(value);

  return date ? date.getTime() : 0;
}

function getDateKey(value) {
  const date = getSafeDate(value);

  if (!date) return "sem-data";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateLabel(value) {
  const date = getSafeDate(value);

  if (!date) return UNKNOWN_LABEL;

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getRegularizacaoActivityDate(regularizacao) {
  return regularizacao?.updatedAt || regularizacao?.createdAt;
}

function getPedidoNumero(regularizacao) {
  const pedidoNumero = Number(
    regularizacao?.pedidoNumero ?? regularizacao?.pedido?.numero,
  );

  if (!Number.isFinite(pedidoNumero)) return null;

  return pedidoNumero;
}

function getUniquePedidoNumbers(regularizacoes = []) {
  const pedidoNumbers = new Set();

  regularizacoes.forEach((regularizacao) => {
    const pedidoNumero = getPedidoNumero(regularizacao);

    if (pedidoNumero) {
      pedidoNumbers.add(pedidoNumero);
    }
  });

  return Array.from(pedidoNumbers).sort((a, b) => a - b);
}

function sortHistoricoRegularizacoes(regularizacoes = []) {
  return [...regularizacoes].sort((a, b) => {
    const dateDiff =
      getDateTimestamp(getRegularizacaoActivityDate(b)) -
      getDateTimestamp(getRegularizacaoActivityDate(a));

    if (dateDiff !== 0) return dateDiff;

    const pedidoDiff = (getPedidoNumero(b) || 0) - (getPedidoNumero(a) || 0);

    if (pedidoDiff !== 0) return pedidoDiff;

    return String(a?.medicamento || "").localeCompare(
      String(b?.medicamento || ""),
      "pt-PT",
      {
        sensitivity: "base",
      },
    );
  });
}

function groupHistoricoByDate(regularizacoes = []) {
  const groupsMap = new Map();

  sortHistoricoRegularizacoes(regularizacoes).forEach((regularizacao) => {
    const dateValue = getRegularizacaoActivityDate(regularizacao);
    const key = getDateKey(dateValue);

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        dateValue,
        dateLabel: getDateLabel(dateValue),
        regularizacoes: [],
        totalRegularizada: 0,
        totalEventos: 0,
      });
    }

    const group = groupsMap.get(key);

    group.regularizacoes.push(regularizacao);
    group.totalRegularizada +=
      getRegularizacaoQuantidadeRegularizada(regularizacao);
    group.totalEventos += getRegularizacaoEventos(regularizacao).length;
  });

  return Array.from(groupsMap.values()).sort((a, b) => {
    return getDateTimestamp(b.dateValue) - getDateTimestamp(a.dateValue);
  });
}

function getLatestActivityLabel(regularizacoes = []) {
  const timestamps = regularizacoes
    .map((regularizacao) => {
      return getDateTimestamp(getRegularizacaoActivityDate(regularizacao));
    })
    .filter((timestamp) => timestamp > 0);

  if (timestamps.length === 0) return UNKNOWN_LABEL;

  return formatDateTime(new Date(Math.max(...timestamps)).toISOString());
}

function buildHistoricoSummary(regularizacoes = []) {
  const [firstRegularizacao] = regularizacoes;

  if (!firstRegularizacao) return null;

  const totalUnidadesRegularizadas = regularizacoes.reduce(
    (total, regularizacao) => {
      return total + getRegularizacaoQuantidadeRegularizada(regularizacao);
    },
    0,
  );

  const totalReceitasUsadas = regularizacoes.reduce((total, regularizacao) => {
    return total + getRegularizacaoEventos(regularizacao).length;
  }, 0);

  const pedidoNumbers = getUniquePedidoNumbers(regularizacoes);

  return {
    utente: firstRegularizacao.utente || null,
    totalRegularizacoes: regularizacoes.length,
    totalUnidadesRegularizadas,
    totalReceitasUsadas,
    pedidoNumbers,
    totalPedidos: pedidoNumbers.length,
    latestActivityLabel: getLatestActivityLabel(regularizacoes),
  };
}

export function useFarmaciaRegularizacoesHistoricoUtente() {
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

  const loadHistorico = useCallback(
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
        const result = await getFarmaciaRegularizacoesHistorico({
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

  const refreshHistorico = useCallback(async () => {
    await loadHistorico({
      showRefreshing: true,
    });
  }, [loadHistorico]);

  const summary = useMemo(() => {
    return buildHistoricoSummary(regularizacoes);
  }, [regularizacoes]);

  const dateGroups = useMemo(() => {
    return groupHistoricoByDate(regularizacoes);
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
      loadHistorico();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadHistorico]);

  return {
    utenteId,
    regularizacoes,
    summary,
    dateGroups,
    meta,

    hasRegularizacoes,

    isLoading,
    isRefreshing,
    error,

    refreshHistorico,
  };
}
