// src/features/santacasa/receitas/utils/receitasList.utils.js
import { RECEITAS_PAGE } from "../config/receitasPage.config";

export function formatDateOnly(value) {
  if (!value) return RECEITAS_PAGE.list.emptyValue;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return RECEITAS_PAGE.list.emptyValue;

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
  }).format(date);
}

export function normalizeMedicationName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getReceitaValidityTime(linha) {
  const time = new Date(linha?.validade).getTime();

  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export function getReceitaPedidoKey(linha) {
  return `COM_RECEITA:${linha.linhaId}`;
}

export function getReceitaDispensedQuantity(linha) {
  return Math.max(0, Number(linha?.quantidadeDispensada) || 0);
}

export function getReceitaUsedInRegularizationQuantity(linha) {
  const explicitValue =
    linha?.quantidadeUsadaRegularizacao ??
    linha?.quantidadeRegularizada ??
    linha?.quantidadeRegularizadaPorReceita;

  const parsedValue = Number(explicitValue);

  if (Number.isFinite(parsedValue)) {
    return Math.max(0, parsedValue);
  }

  return 0;
}

export function getReceitaRestanteQuantity(linha) {
  return Math.max(0, Number(linha?.quantidadeRestante) || 0);
}

export function getReceitaPendingQuantity(linha) {
  const explicitPending =
    linha?.quantidadeReservadaPendente ??
    linha?.quantidadeEmPedido ??
    linha?.quantidadePendente;

  const parsedExplicitPending = Number(explicitPending);

  if (Number.isFinite(parsedExplicitPending)) {
    return Math.max(0, parsedExplicitPending);
  }

  const total = Number(linha?.quantidade) || 0;
  const dispensada = getReceitaDispensedQuantity(linha);
  const restante = getReceitaRestanteQuantity(linha);

  return Math.max(0, total - dispensada - restante);
}

export function getReceitaAvailableQuantity(linha, pedidoItemsQuantities = {}) {
  const pedidoKey = getReceitaPedidoKey(linha);
  const quantidadeRestante = getReceitaRestanteQuantity(linha);
  const quantidadeEmPedidoLocal = Number(pedidoItemsQuantities[pedidoKey]) || 0;

  return Math.max(0, quantidadeRestante - quantidadeEmPedidoLocal);
}

export function isSameMedication(a, b) {
  return (
    normalizeMedicationName(a?.medicamento) ===
    normalizeMedicationName(b?.medicamento)
  );
}

export function hasEarlierAvailableReceita({
  linha,
  receitas = [],
  pedidoItemsQuantities = {},
}) {
  if (!linha?.linhaId || !linha?.medicamento) return false;

  const currentValidityTime = getReceitaValidityTime(linha);

  return receitas.some((candidate) => {
    if (!candidate?.linhaId) return false;
    if (candidate.linhaId === linha.linhaId) return false;
    if (!isSameMedication(candidate, linha)) return false;

    const candidateValidityTime = getReceitaValidityTime(candidate);

    if (candidateValidityTime >= currentValidityTime) return false;

    return getReceitaAvailableQuantity(candidate, pedidoItemsQuantities) > 0;
  });
}

export function buildPedidoItem(linha) {
  return {
    key: getReceitaPedidoKey(linha),
    tipo: "COM_RECEITA",
    id: linha.linhaId,
    title: linha.medicamento,
    description: `${RECEITAS_PAGE.list.labels.receitaPrefix} ${linha.numero19}`,
    meta: `${RECEITAS_PAGE.list.labels.pinPrefix} ${linha.pinAcesso6} · ${RECEITAS_PAGE.list.labels.optionPrefix} ${linha.pinOpcao4}`,

    numero19: linha.numero19,
    pinAcesso6: linha.pinAcesso6,
    pinOpcao4: linha.pinOpcao4,
    validade: linha.validade,

    quantidadeRestante: getReceitaRestanteQuantity(linha),
    source: linha,
  };
}

export function getInputQuantity(value, max) {
  if (max <= 0) return 0;

  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}

export function getPedidoButtonLabel({
  quantidadeDisponivel,
  isBlockedByFefo,
}) {
  if (quantidadeDisponivel <= 0) {
    return RECEITAS_PAGE.list.pedidoActions.noStockLabel;
  }

  if (isBlockedByFefo) {
    return RECEITAS_PAGE.list.pedidoActions.usePreviousLabel;
  }

  return RECEITAS_PAGE.list.pedidoActions.addLabel;
}
