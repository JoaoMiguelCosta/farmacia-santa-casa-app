// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/santaCasaRegularizacoesList.utils.js

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

export function getSectionConfig(variant) {
  if (variant === "history") {
    return SANTACASA_REGULARIZACOES_PAGE.sections.history;
  }

  return SANTACASA_REGULARIZACOES_PAGE.sections.pending;
}
