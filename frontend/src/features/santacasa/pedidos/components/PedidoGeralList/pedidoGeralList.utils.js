// src/features/santacasa/pedidos/components/PedidoGeralList/pedidoGeralList.utils.js

import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

export function isValidPedidoGeralItem(item) {
  return Boolean(item?.key && item?.utenteId && item?.tipo && item?.id);
}

export function getValidPedidoGeralItems(items = []) {
  return Array.isArray(items) ? items.filter(isValidPedidoGeralItem) : [];
}

export function getTypeLabel(tipo) {
  if (tipo === "COM_RECEITA") {
    return PEDIDOS_PAGE.labels.receita;
  }

  if (tipo === "SEM_RECEITA") {
    return PEDIDOS_PAGE.labels.semReceita;
  }

  if (tipo === "EXTRA") {
    return PEDIDOS_PAGE.labels.extra;
  }

  return tipo || PEDIDOS_PAGE.labels.emptyValue;
}

export function getQuantityInfo(item = {}) {
  const maximoDisponivel = Math.max(
    0,
    Math.floor(Number(item?.quantidadeRestante) || 0),
  );

  const quantidadeNoPedido = Math.max(
    0,
    Math.floor(Number(item?.quantidade) || 0),
  );

  const quantidadeNaOrigem = Math.max(0, maximoDisponivel - quantidadeNoPedido);

  return {
    maximoDisponivel,
    quantidadeNoPedido,
    quantidadeNaOrigem,
  };
}

export function getSafeDetailsId(prefix, key) {
  const safeKey = String(key || "grupo").replace(/[^a-zA-Z0-9_-]/g, "-");

  return `${prefix}-${safeKey}`;
}

function extractReceitaNumber(description) {
  const match = String(description || "").match(/receita\s+([0-9]+)/i);

  return match?.[1] || "";
}

function extractPinAcesso(meta) {
  const match = String(meta || "").match(/pin\s+([0-9]+)/i);

  return match?.[1] || "";
}

function extractPinOpcao(meta) {
  const match = String(meta || "").match(/opção\s+([0-9]+)/i);

  return match?.[1] || "";
}

export function getPedidoGeralReceita(item = {}) {
  if (item?.tipo !== "COM_RECEITA") {
    return null;
  }

  const source = item?.source || {};

  return {
    id: source?.receita?.id || source?.id || item?.id,

    numero19:
      source?.receita?.numero19 ||
      source?.numero19 ||
      item?.numero19 ||
      extractReceitaNumber(item?.description),

    pinAcesso6:
      source?.receita?.pinAcesso6 ||
      source?.pinAcesso6 ||
      item?.pinAcesso6 ||
      extractPinAcesso(item?.meta),

    pinOpcao4:
      source?.receita?.pinOpcao4 ||
      source?.pinOpcao4 ||
      item?.pinOpcao4 ||
      extractPinOpcao(item?.meta),

    validade:
      source?.receitaLinha?.validade ||
      source?.receita?.validade ||
      source?.validade ||
      item?.validade ||
      "",
  };
}

export function hasReceitaBarcodeData(receita) {
  return Boolean(
    receita?.numero19 || receita?.pinAcesso6 || receita?.pinOpcao4,
  );
}

export function getReceitaBarcodeCodes(receita = {}) {
  return [
    {
      key: "numero19",
      label: PEDIDOS_PAGE.labels.receitaNumber,
      value: receita?.numero19,
      width: 0.72,
    },
    {
      key: "pinAcesso6",
      label: PEDIDOS_PAGE.labels.pinAcesso,
      value: receita?.pinAcesso6,
      width: 1.08,
    },
    {
      key: "pinOpcao4",
      label: PEDIDOS_PAGE.labels.pinOpcao,
      value: receita?.pinOpcao4,
      width: 1.16,
    },
  ].filter((code) => code.value);
}

export function getReceitaValidityLabel(receita = {}) {
  if (!receita?.validade) {
    return "";
  }

  const date = new Date(receita.validade);

  if (Number.isNaN(date.getTime())) {
    return String(receita.validade);
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function groupByUtente(items = []) {
  const groupsMap = new Map();

  const validItems = getValidPedidoGeralItems(items);

  validItems.forEach((item) => {
    const groupKey = item.utenteId;

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        utenteId: item.utenteId,

        utenteNome: item.utenteNome || PEDIDOS_PAGE.labels.utenteFallback,

        utenteNumero9: item.utenteNumero9 || "",

        items: [],
      });
    }

    groupsMap.get(groupKey).items.push(item);
  });

  return Array.from(groupsMap.values())
    .map((group) => ({
      ...group,

      items: getValidPedidoGeralItems(group.items).sort(
        (firstItem, secondItem) => {
          const typeComparison = collator.compare(
            firstItem.tipo || "",
            secondItem.tipo || "",
          );

          if (typeComparison !== 0) {
            return typeComparison;
          }

          return collator.compare(
            firstItem.title || "",
            secondItem.title || "",
          );
        },
      ),
    }))
    .filter((group) => group.items.length > 0)
    .sort((firstGroup, secondGroup) => {
      const nameComparison = collator.compare(
        firstGroup.utenteNome,
        secondGroup.utenteNome,
      );

      if (nameComparison !== 0) {
        return nameComparison;
      }

      return collator.compare(
        firstGroup.utenteNumero9,
        secondGroup.utenteNumero9,
      );
    });
}

export function getPluralLabel({ amount, singular, plural }) {
  return amount === 1 ? singular : plural;
}

export function getItemsCountLabel(count) {
  return count === 1
    ? PEDIDOS_PAGE.labels.itemSingular
    : PEDIDOS_PAGE.labels.itemPlural;
}

export function getMedicamentosCountLabel(count) {
  return `${count} ${getPluralLabel({
    amount: count,

    singular: PEDIDOS_PAGE.labels.itemSingular,

    plural: PEDIDOS_PAGE.labels.itemPlural,
  })}`;
}

export function getUnidadesCountLabel(count) {
  return `${count} ${getPluralLabel({
    amount: count,

    singular: PEDIDOS_PAGE.labels.unidadeSingular,

    plural: PEDIDOS_PAGE.labels.unidadePlural,
  })}`;
}

export function getItemsQuantityTotal(items = []) {
  return items.reduce((total, item) => {
    return total + (Number(item?.quantidade) || 0);
  }, 0);
}
