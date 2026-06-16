// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/santaCasaRegularizacaoCard.utils.js

import { classNames } from "../../../../../shared/utils/classNames";

export function getEventoReceita(evento) {
  return evento?.receitaLinha?.receita ?? null;
}

export function getUnidadeLabel(value) {
  const quantidade = Number(value);

  if (!Number.isFinite(quantidade)) return "unidades";

  return quantidade === 1 ? "unidade" : "unidades";
}

export function getSafeUnitValue(value) {
  const quantidade = Number(value);

  return Number.isFinite(quantidade) ? quantidade : "—";
}

export function getCardClassName({ styles, isCompleted, isHistory }) {
  return classNames(
    styles.card,
    isCompleted && styles.cardCompleted,
    isHistory && styles.cardHistory,
  );
}

export function getStatusClassName({ styles, isCompleted }) {
  return classNames(
    styles.status,
    isCompleted ? styles.statusCompleted : styles.statusPending,
  );
}
