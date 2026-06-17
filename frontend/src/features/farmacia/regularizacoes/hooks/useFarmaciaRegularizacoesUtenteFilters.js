import { useMemo, useState } from "react";

import { FARMACIA_REGULARIZACOES_PAGE } from "../config/farmaciaRegularizacoesPage.config";
import {
  INITIAL_VISIBLE_MEDICAMENTOS,
  STATUS_FILTER_ALL,
  VISIBLE_MEDICAMENTOS_INCREMENT,
  filterMedicamentos,
} from "../utils/farmaciaRegularizacoesUtente.utils";

export function useFarmaciaRegularizacoesUtenteFilters({ medicamentos }) {
  const [medicamentoSearch, setMedicamentoSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_ALL);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_MEDICAMENTOS);

  const visibleMedicamentos = useMemo(() => {
    return filterMedicamentos({
      medicamentos,
      search: medicamentoSearch,
      status: statusFilter,
    });
  }, [medicamentos, medicamentoSearch, statusFilter]);

  const displayedMedicamentos = useMemo(() => {
    return visibleMedicamentos.slice(0, visibleCount);
  }, [visibleMedicamentos, visibleCount]);

  const hiddenMedicamentosCount = Math.max(
    0,
    visibleMedicamentos.length - displayedMedicamentos.length,
  );

  const nextVisibleMedicamentosCount = Math.min(
    VISIBLE_MEDICAMENTOS_INCREMENT,
    hiddenMedicamentosCount,
  );

  const hasVisibleMedicamentos = displayedMedicamentos.length > 0;

  const hasActiveFilters =
    Boolean(medicamentoSearch.trim()) || statusFilter !== STATUS_FILTER_ALL;

  const canShowMore = hiddenMedicamentosCount > 0;

  const canShowLess =
    visibleCount > INITIAL_VISIBLE_MEDICAMENTOS &&
    visibleMedicamentos.length > INITIAL_VISIBLE_MEDICAMENTOS;

  const medicinesResultsLabel =
    FARMACIA_REGULARIZACOES_PAGE.details.getMedicinesResultsLabel({
      visible: displayedMedicamentos.length,
      filtered: visibleMedicamentos.length,
      total: medicamentos.length,
    });

  const viewMoreMedicinesLabel =
    FARMACIA_REGULARIZACOES_PAGE.details.getViewMoreMedicinesLabel({
      count: nextVisibleMedicamentosCount,
    });

  const hiddenMedicinesLabel =
    FARMACIA_REGULARIZACOES_PAGE.details.getHiddenMedicinesLabel({
      hidden: hiddenMedicamentosCount,
    });

  function updateMedicamentoSearch(value) {
    setMedicamentoSearch(value);
    setVisibleCount(INITIAL_VISIBLE_MEDICAMENTOS);
  }

  function updateStatusFilter(value) {
    setStatusFilter(value);
    setVisibleCount(INITIAL_VISIBLE_MEDICAMENTOS);
  }

  function clearDetailsFilters() {
    setMedicamentoSearch("");
    setStatusFilter(STATUS_FILTER_ALL);
    setVisibleCount(INITIAL_VISIBLE_MEDICAMENTOS);
  }

  function showMoreMedicamentos() {
    setVisibleCount((current) =>
      Math.min(current + VISIBLE_MEDICAMENTOS_INCREMENT, visibleMedicamentos.length),
    );
  }

  function showAllMedicamentos() {
    setVisibleCount(visibleMedicamentos.length);
  }

  function showLessMedicamentos() {
    setVisibleCount(INITIAL_VISIBLE_MEDICAMENTOS);
  }

  return {
    medicamentoSearch,
    statusFilter,
    displayedMedicamentos,
    hasVisibleMedicamentos,
    hasActiveFilters,
    canShowMore,
    canShowLess,
    medicinesResultsLabel,
    viewMoreMedicinesLabel,
    hiddenMedicinesLabel,
    updateMedicamentoSearch,
    updateStatusFilter,
    clearDetailsFilters,
    showMoreMedicamentos,
    showAllMedicamentos,
    showLessMedicamentos,
  };
}
