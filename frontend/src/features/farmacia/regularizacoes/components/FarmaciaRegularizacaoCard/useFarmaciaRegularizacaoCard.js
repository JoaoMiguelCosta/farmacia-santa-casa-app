import { useCallback, useState } from "react";

import {
  getRegularizacaoEventos,
  getRegularizacaoMedicamentoLabel,
  getRegularizacaoOrigins,
  getRegularizacaoProgressPercent,
  getRegularizacaoStatusLabel,
  hasRegularizacaoEventos,
} from "../../utils/farmaciaRegularizacoes.utils";

function getVisibleOrigins(regularizacao, origins) {
  if (!regularizacao?.isAggregated) {
    return [];
  }

  if (origins.length <= 1) {
    return [];
  }

  return origins;
}

export function useFarmaciaRegularizacaoCard({
  regularizacao,
  variant = "pending",
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isHistory = variant === "history";
  const eventos = getRegularizacaoEventos(regularizacao);
  const origins = getRegularizacaoOrigins(regularizacao);
  const visibleOrigins = getVisibleOrigins(regularizacao, origins);

  const hasEventos = hasRegularizacaoEventos(regularizacao);
  const hasOrigins = visibleOrigins.length > 0;
  const hasDetails = hasEventos || hasOrigins;

  const toggleDetails = useCallback(() => {
    setIsDetailsOpen((currentValue) => !currentValue);
  }, []);

  return {
    isHistory,
    isDetailsOpen,
    progressPercent: getRegularizacaoProgressPercent(regularizacao),
    eventos,
    origins: visibleOrigins,
    hasEventos,
    hasOrigins,
    hasDetails,
    medicamentoLabel: getRegularizacaoMedicamentoLabel(regularizacao),
    statusLabel: getRegularizacaoStatusLabel(regularizacao?.status),
    toggleDetails,
  };
}
