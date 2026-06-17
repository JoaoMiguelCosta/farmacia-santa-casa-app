export * from "../../../../shared/utils/regularizacoesAccessors.utils";

import { SANTACASA_REGULARIZACOES_PAGE } from "../config/santaCasaRegularizacoesPage.config";

const UNKNOWN_LABEL = "—";

export function getRegularizacaoUtenteKey(regularizacao) {
  return (
    regularizacao?.utente?.id ||
    regularizacao?.utenteId ||
    regularizacao?.utente?.numero9 ||
    `utente-${UNKNOWN_LABEL}`
  );
}

export function getRegularizacaoUtenteNomeLabel(regularizacao) {
  return regularizacao?.utente?.nome || UNKNOWN_LABEL;
}

export function getRegularizacaoUtenteNumeroLabel(regularizacao) {
  return regularizacao?.utente?.numero9 || UNKNOWN_LABEL;
}

export function getRegularizacaoStatusLabel(status) {
  return (
    SANTACASA_REGULARIZACOES_PAGE.status[status] || status || UNKNOWN_LABEL
  );
}

export function getRegularizacaoSituationTitle(regularizacao) {
  if (regularizacao?.status === "REGULARIZADO") {
    return SANTACASA_REGULARIZACOES_PAGE.completedRecipe.title;
  }

  return SANTACASA_REGULARIZACOES_PAGE.waitingRecipe.title;
}

export function getRegularizacaoSituationDescription(regularizacao) {
  if (regularizacao?.status === "REGULARIZADO") {
    return SANTACASA_REGULARIZACOES_PAGE.completedRecipe.description;
  }

  return SANTACASA_REGULARIZACOES_PAGE.waitingRecipe.description;
}

export function buildRegularizacoesQuery({
  search = "",
  from = "",
  to = "",
  skip = 0,
  take = 50,
} = {}) {
  const normalizedSearch = String(search || "").trim();
  const normalizedFrom = String(from || "").trim();
  const normalizedTo = String(to || "").trim();

  return {
    skip,
    take,
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    ...(normalizedFrom ? { from: normalizedFrom } : {}),
    ...(normalizedTo ? { to: normalizedTo } : {}),
  };
}
