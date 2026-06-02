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
  if (tipo === "COM_RECEITA") return PEDIDOS_PAGE.labels.receita;
  if (tipo === "SEM_RECEITA") return PEDIDOS_PAGE.labels.semReceita;
  if (tipo === "EXTRA") return PEDIDOS_PAGE.labels.extra;

  return tipo || "—";
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
  return `${prefix}-${String(key || "grupo").replace(/[^a-zA-Z0-9_-]/g, "-")}`;
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
  if (item?.tipo !== "COM_RECEITA") return null;

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
  if (!receita?.validade) return "";

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
      items: getValidPedidoGeralItems(group.items).sort((a, b) => {
        const tipoCompare = collator.compare(a.tipo || "", b.tipo || "");

        if (tipoCompare !== 0) return tipoCompare;

        return collator.compare(a.title || "", b.title || "");
      }),
    }))
    .filter((group) => group.items.length > 0)
    .sort((a, b) => {
      const nameCompare = collator.compare(a.utenteNome, b.utenteNome);

      if (nameCompare !== 0) return nameCompare;

      return collator.compare(a.utenteNumero9, b.utenteNumero9);
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

export function getVisibleMedicamentosLabel({ visible, total }) {
  return PEDIDOS_PAGE.sections.draft.visibleMedicamentosLabel
    .replace("{visible}", visible)
    .replace("{total}", total);
}

export function getViewMoreMedicamentosLabel(amount) {
  return PEDIDOS_PAGE.actions.viewMoreMedicamentos.replace("{amount}", amount);
}

export function getRemainingMedicamentosCount({ visible, total, step }) {
  const safeVisible = Math.max(0, Math.floor(Number(visible)) || 0);
  const safeTotal = Math.max(0, Math.floor(Number(total)) || 0);
  const safeStep = Math.max(1, Math.floor(Number(step)) || 1);

  return Math.min(Math.max(0, safeTotal - safeVisible), safeStep);
}

export function getNextVisibleMedicamentosCount({
  currentVisible,
  total,
  step,
}) {
  const safeCurrentVisible = Math.max(
    0,
    Math.floor(Number(currentVisible)) || 0,
  );

  const safeTotal = Math.max(0, Math.floor(Number(total)) || 0);
  const safeStep = Math.max(1, Math.floor(Number(step)) || 1);

  return Math.min(safeCurrentVisible + safeStep, safeTotal);
}

export function getLimitedPedidoItems(items = [], limit) {
  const maxVisible = Math.floor(Number(limit));

  if (!Number.isFinite(maxVisible) || maxVisible <= 0) {
    return items;
  }

  return items.slice(0, maxVisible);
}
