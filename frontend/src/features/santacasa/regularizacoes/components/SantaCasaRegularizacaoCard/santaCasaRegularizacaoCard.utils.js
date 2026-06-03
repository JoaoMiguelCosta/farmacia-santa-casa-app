// src/features/santacasa/regularizacoes/components/SantaCasaRegularizacaoCard/santaCasaRegularizacaoCard.utils.js

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
  return [
    styles.card,
    isCompleted ? styles.cardCompleted : "",
    isHistory ? styles.cardHistory : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function getStatusClassName({ styles, isCompleted }) {
  return isCompleted
    ? `${styles.status} ${styles.statusCompleted}`
    : `${styles.status} ${styles.statusPending}`;
}
