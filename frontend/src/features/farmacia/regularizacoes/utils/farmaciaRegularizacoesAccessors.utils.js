export * from "../../../../shared/utils/regularizacoesAccessors.utils";

import { FARMACIA_REGULARIZACOES_PAGE } from "../config/farmaciaRegularizacoesPage.config";

const UNKNOWN_LABEL = "—";

export function getRegularizacaoStatusLabel(status) {
  return FARMACIA_REGULARIZACOES_PAGE.status[status] || status || UNKNOWN_LABEL;
}

export function getRegularizacaoOrigins(regularizacao) {
  if (Array.isArray(regularizacao?.origemRegularizacoes)) {
    return regularizacao.origemRegularizacoes;
  }

  return regularizacao ? [regularizacao] : [];
}

export function hasRegularizacaoOrigins(regularizacao) {
  return getRegularizacaoOrigins(regularizacao).length > 0;
}

export function buildRegularizacoesQuery({
  search = "",
  medicamento = "",
  from = "",
  to = "",
  skip = 0,
  take = 50,
} = {}) {
  const normalizedSearch = String(search || "").trim();
  const normalizedMedicamento = String(medicamento || "").trim();
  const normalizedFrom = String(from || "").trim();
  const normalizedTo = String(to || "").trim();

  return {
    skip,
    take,
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    ...(normalizedMedicamento ? { medicamento: normalizedMedicamento } : {}),
    ...(normalizedFrom ? { from: normalizedFrom } : {}),
    ...(normalizedTo ? { to: normalizedTo } : {}),
  };
}
