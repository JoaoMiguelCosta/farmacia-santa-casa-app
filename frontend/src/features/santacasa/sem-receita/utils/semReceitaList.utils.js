// src/features/santacasa/sem-receita/utils/semReceitaList.utils.js
import { formatDateTime } from "../../../../shared/utils/formatDate";

import { SEM_RECEITA_PAGE } from "../config/semReceitaPage.config";

export function getSemReceitaPedidoKey(item) {
  return `SEM_RECEITA:${item.id}`;
}

export function getSemReceitaPendingQuantity(item) {
  return Math.max(0, Number(item?.quantidadeReservadaPendente) || 0);
}

export function getSemReceitaDispensedQuantity(item) {
  return Math.max(0, Number(item?.quantidadeDispensada) || 0);
}

export function getSemReceitaAvailableQuantity(
  item,
  pedidoItemsQuantities = {},
) {
  const pedidoKey = getSemReceitaPedidoKey(item);
  const quantidadeRestante = Number(item?.quantidadeRestante) || 0;
  const quantidadeEmPedidoLocal = Number(pedidoItemsQuantities[pedidoKey]) || 0;

  return Math.max(0, quantidadeRestante - quantidadeEmPedidoLocal);
}

export function buildPedidoItem(item) {
  return {
    key: getSemReceitaPedidoKey(item),
    tipo: "SEM_RECEITA",
    id: item.id,
    title: item.medicamento,
    description: SEM_RECEITA_PAGE.list.labels.semReceitaDescription,
    meta: `${SEM_RECEITA_PAGE.list.labels.total} ${
      item.quantidade
    } · ${SEM_RECEITA_PAGE.list.labels.dispensada} ${getSemReceitaDispensedQuantity(
      item,
    )}`,
    quantidadeRestante: Number(item.quantidadeRestante) || 0,
    source: item,
  };
}

export function getInputQuantity(value, max) {
  if (max <= 0) return 0;

  const quantity = Math.floor(Number(value));

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.min(quantity, max);
}

export function getPedidoButtonLabel(quantidadeDisponivel) {
  if (quantidadeDisponivel <= 0) {
    return SEM_RECEITA_PAGE.list.pedidoActions.noStockLabel;
  }

  return SEM_RECEITA_PAGE.list.pedidoActions.addLabel;
}

export function formatCreatedAt(value) {
  if (!value) return SEM_RECEITA_PAGE.list.emptyValue;

  return formatDateTime(value);
}
