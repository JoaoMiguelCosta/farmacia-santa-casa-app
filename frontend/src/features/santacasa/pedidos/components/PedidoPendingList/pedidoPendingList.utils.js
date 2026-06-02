// src/features/santacasa/pedidos/components/PedidoPendingList/pedidoPendingList.utils.js
import { PEDIDOS_PAGE } from "../../config/pedidosPage.config";

const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

export function getPedidoNumberLabel(pedido) {
  const numero = Number(pedido?.numero);

  if (!Number.isFinite(numero)) {
    return PEDIDOS_PAGE.labels.emptyValue;
  }

  return `#${numero}`;
}

export function getTypeLabel(tipo) {
  if (tipo === "COM_RECEITA") return PEDIDOS_PAGE.labels.receita;
  if (tipo === "SEM_RECEITA") return PEDIDOS_PAGE.labels.semReceita;
  if (tipo === "EXTRA") return PEDIDOS_PAGE.labels.extra;

  return tipo || PEDIDOS_PAGE.labels.emptyValue;
}

export function getPedidoItems(pedido) {
  return Array.isArray(pedido?.itens) ? pedido.itens.filter(Boolean) : [];
}

export function getPedidoItemKey(item, index) {
  return item?.id || `${item?.tipo || "item"}-${item?.medicamento || index}`;
}

export function getPedidoTotalQuantity(pedido) {
  return getPedidoItems(pedido).reduce((total, item) => {
    return total + (Number(item?.quantidade) || 0);
  }, 0);
}

export function getPedidoUtentesCount(pedido) {
  const utentesIds = new Set();

  getPedidoItems(pedido).forEach((item) => {
    if (item?.utente?.id) {
      utentesIds.add(item.utente.id);
    }
  });

  return utentesIds.size;
}

export function getPedidoMedicamentosCount(pedido) {
  return getPedidoItems(pedido).length;
}

export function getPluralLabel({ amount, singular, plural }) {
  return amount === 1 ? singular : plural;
}

export function getUtentesCountLabel(count) {
  return `${count} ${getPluralLabel({
    amount: count,
    singular: PEDIDOS_PAGE.labels.utenteSingular,
    plural: PEDIDOS_PAGE.labels.utentePlural,
  })}`;
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

export function getVisibleMedicamentosLabel({ visible, total }) {
  return PEDIDOS_PAGE.sections.pending.visibleMedicamentosLabel
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

export function getPedidoItemReceita(item) {
  if (item?.tipo !== "COM_RECEITA") return null;

  if (item?.receitaLinha) {
    return {
      ...item.receitaLinha.receita,
      validade: item.receitaLinha.validade,
    };
  }

  if (item?.receita) {
    return item.receita;
  }

  if (item?.numero19 || item?.pinAcesso6 || item?.pinOpcao4) {
    return item;
  }

  return null;
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
      value: receita.numero19,
      width: 0.72,
    },
    {
      key: "pinAcesso6",
      label: PEDIDOS_PAGE.labels.pinAcesso,
      value: receita.pinAcesso6,
      width: 1.08,
    },
    {
      key: "pinOpcao4",
      label: PEDIDOS_PAGE.labels.pinOpcao,
      value: receita.pinOpcao4,
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

export function groupPedidoItemsByUtente(items = []) {
  const groupsMap = new Map();

  items.filter(Boolean).forEach((item) => {
    const utente = item?.utente;
    const groupKey = utente?.id || "sem-utente";

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        utenteId: groupKey,
        utenteNome: utente?.nome || PEDIDOS_PAGE.labels.utenteFallback,
        utenteNumero9: utente?.numero9 || PEDIDOS_PAGE.labels.emptyValue,
        items: [],
      });
    }

    groupsMap.get(groupKey).items.push(item);
  });

  return Array.from(groupsMap.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => {
        const tipoCompare = collator.compare(a?.tipo || "", b?.tipo || "");

        if (tipoCompare !== 0) return tipoCompare;

        return collator.compare(a?.medicamento || "", b?.medicamento || "");
      }),
    }))
    .sort((a, b) => {
      const nameCompare = collator.compare(a.utenteNome, b.utenteNome);

      if (nameCompare !== 0) return nameCompare;

      return collator.compare(a.utenteNumero9, b.utenteNumero9);
    });
}

export function getLimitedPedidoGroups(groups = [], limit) {
  const maxVisible = Math.floor(Number(limit));

  if (!Number.isFinite(maxVisible) || maxVisible <= 0) {
    return groups;
  }

  let remaining = maxVisible;

  return groups
    .map((group) => {
      if (remaining <= 0) {
        return {
          ...group,
          items: [],
        };
      }

      const visibleItems = group.items.slice(0, remaining);
      remaining -= visibleItems.length;

      return {
        ...group,
        items: visibleItems,
      };
    })
    .filter((group) => group.items.length > 0);
}

export function getPaginationLabel({ meta, currentPage, totalPages }) {
  const total = Number(meta?.total) || 0;
  const skip = Number(meta?.skip) || 0;
  const take = Number(meta?.take) || 0;

  if (total === 0) {
    return PEDIDOS_PAGE.sections.pending.paginationEmptyLabel;
  }

  const start = skip + 1;
  const end = Math.min(skip + take, total);

  return PEDIDOS_PAGE.sections.pending.paginationLabel
    .replace("{start}", start)
    .replace("{end}", end)
    .replace("{total}", total)
    .replace("{currentPage}", currentPage)
    .replace("{totalPages}", totalPages);
}
