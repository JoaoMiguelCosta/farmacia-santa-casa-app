// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacoesList/santaCasaRegularizacoesList.utils.js

import { SANTACASA_REGULARIZACOES_PAGE } from "../../config/santaCasaRegularizacoesPage.config";

export const GROUP_THRESHOLD = 2;

export const INITIAL_VISIBLE_MEDICAMENTOS = 5;
export const VISIBLE_MEDICAMENTOS_INCREMENT = 5;

export const INITIAL_VISIBLE_HISTORY = 5;
export const VISIBLE_HISTORY_INCREMENT = 5;

export function getSectionConfig(variant) {
  if (variant === "history") {
    return SANTACASA_REGULARIZACOES_PAGE.sections.history;
  }

  return SANTACASA_REGULARIZACOES_PAGE.sections.pending;
}

export function getRegularizacoesPendentesCountLabel(total) {
  const count = Number(total) || 0;

  return `${count} ${
    count === 1 ? "regularização pendente" : "regularizações pendentes"
  }`;
}

export function getRegularizacoesConcluidasShortLabel(total) {
  const count = Number(total) || 0;

  return `${count} ${count === 1 ? "concluída" : "concluídas"}`;
}

export function getUnidadesLabel(value) {
  const total = Number(value) || 0;

  return `${total} ${total === 1 ? "unidade" : "unidades"}`;
}

export function getUnidadesRegularizadasShortLabel(value) {
  const total = Number(value) || 0;

  return `${total} ${total === 1 ? "regularizada" : "regularizadas"}`;
}

export function getReceitasUsadasShortLabel(value) {
  const total = Number(value) || 0;

  return `${total} ${total === 1 ? "usada" : "usadas"}`;
}

export function getViewMoreMedicamentosLabel(hiddenCount) {
  const nextVisibleCount = Math.min(
    VISIBLE_MEDICAMENTOS_INCREMENT,
    Number(hiddenCount) || 0,
  );

  return `${SANTACASA_REGULARIZACOES_PAGE.actions.viewMoreMedicamentos} ${nextVisibleCount}`;
}

export function getViewMoreRegularizacoesLabel(hiddenCount) {
  const nextVisibleCount = Math.min(
    VISIBLE_HISTORY_INCREMENT,
    Number(hiddenCount) || 0,
  );

  return `${SANTACASA_REGULARIZACOES_PAGE.actions.viewMoreRegularizacoes} ${nextVisibleCount}`;
}

export function getHiddenMedicamentosLabel(hiddenCount) {
  const count = Number(hiddenCount) || 0;

  return `Ainda existem ${count} medicamento${
    count === 1 ? "" : "s"
  } por mostrar.`;
}

export function getHistoryHiddenLabel(hiddenCount) {
  const count = Number(hiddenCount) || 0;

  if (count === 1) {
    return "Ainda existe 1 regularização por mostrar neste dia.";
  }

  return `Ainda existem ${count} regularizações por mostrar neste dia.`;
}
