// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/useSantaCasaRegularizacaoCard.js

import { useCallback, useMemo, useState } from "react";

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

import {
  getRegularizacaoCreatedAtLabel,
  getRegularizacaoEventos,
  getRegularizacaoUpdatedAtLabel,
} from "../../utils/santaCasaRegularizacoes.utils";

export function useSantaCasaRegularizacaoCard({
  regularizacao,
  variant = "pending",
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isHistory = variant === "history";
  const isCompleted = regularizacao?.status === "REGULARIZADO";

  const eventos = useMemo(() => {
    return getRegularizacaoEventos(regularizacao);
  }, [regularizacao]);

  const hasEventos = eventos.length > 0;

  const dateLabel = isHistory
    ? SANTACASA_REGULARIZACOES_PAGE.labels.updatedAt
    : SANTACASA_REGULARIZACOES_PAGE.labels.createdAt;

  const dateValue = isHistory
    ? getRegularizacaoUpdatedAtLabel(regularizacao)
    : getRegularizacaoCreatedAtLabel(regularizacao);

  const toggleDetails = useCallback(() => {
    setIsDetailsOpen((currentValue) => !currentValue);
  }, []);

  return {
    isHistory,
    isCompleted,

    eventos,
    hasEventos,

    dateLabel,
    dateValue,

    isDetailsOpen,
    toggleDetails,
  };
}
