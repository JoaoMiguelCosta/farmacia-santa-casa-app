// src/features/santacasa/shared/pedidos/utils/santaCasaPedido.utils.js

import {
  SANTACASA_PEDIDO_ITEM_TYPES,
  SANTACASA_PEDIDO_UI,
} from "../config/santaCasaPedidoUi.config";

const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

function getSafeString(value) {
  return String(value || "").trim();
}

function getSafeQuantity(value) {
  const quantity = Number(value);

  return Number.isFinite(quantity) ? quantity : 0;
}

function formatPedidoDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getSantaCasaPedidoItems(pedido) {
  if (Array.isArray(pedido?.itens)) {
    return pedido.itens.filter(Boolean);
  }

  if (Array.isArray(pedido?.items)) {
    return pedido.items.filter(Boolean);
  }

  return [];
}

export function getSantaCasaPedidoNumberLabel(
  pedido,
  {
    prefix = SANTACASA_PEDIDO_UI.labels.pedidoPrefix,
    emptyValue = SANTACASA_PEDIDO_UI.labels.emptyValue,
  } = {},
) {
  const numero = Number(pedido?.numero);

  if (!Number.isFinite(numero)) {
    return emptyValue;
  }

  return `${prefix}${numero}`;
}

export function getSantaCasaPedidoItemKey(item, index = 0) {
  return (
    item?.id ||
    item?.linhaId ||
    item?.receitaLinhaId ||
    `${item?.tipo || "item"}-${item?.medicamento || index}`
  );
}

export function getSantaCasaPedidoItemTypeLabel(
  tipo,
  { emptyValue = SANTACASA_PEDIDO_UI.labels.emptyValue } = {},
) {
  return SANTACASA_PEDIDO_UI.itemTypes[tipo] || tipo || emptyValue;
}

export function getSantaCasaPedidoItemStatusLabel(
  status,
  { emptyValue = SANTACASA_PEDIDO_UI.labels.emptyValue } = {},
) {
  return SANTACASA_PEDIDO_UI.itemStatus[status] || status || emptyValue;
}

export function getSantaCasaPedidoItemMedicationLabel(
  item,
  { fallback = SANTACASA_PEDIDO_UI.labels.medicamentoFallback } = {},
) {
  return (
    getSafeString(item?.medicamento) ||
    getSafeString(item?.nome) ||
    getSafeString(item?.title) ||
    getSafeString(item?.receitaLinha?.nome) ||
    getSafeString(item?.source?.medicamento) ||
    getSafeString(item?.source?.nome) ||
    fallback
  );
}

export function getSantaCasaPedidoItemQuantity(item) {
  return getSafeQuantity(item?.quantidade);
}

export function getSantaCasaPedidoItemUtente(item) {
  const source = item?.utente || item?.source?.utente || {};

  return {
    id: getSafeString(item?.utenteId || source?.id),

    nome: getSafeString(
      source?.nome ||
        source?.name ||
        item?.utenteNome ||
        SANTACASA_PEDIDO_UI.labels.utenteFallback,
    ),

    numero9: getSafeString(
      source?.numero9 ||
        source?.numero ||
        source?.numeroUtente ||
        item?.utenteNumero9,
    ),
  };
}

export function getSantaCasaPedidoItemUtenteKey(item) {
  const utente = getSantaCasaPedidoItemUtente(item);

  return (
    utente.id ||
    utente.numero9 ||
    getSafeString(utente.nome) ||
    "utente-sem-identificacao"
  );
}

export function getSantaCasaPedidoItemUtenteLabel(
  item,
  {
    emptyValue = SANTACASA_PEDIDO_UI.labels.emptyValue,
    separator = " · ",
  } = {},
) {
  const utente = getSantaCasaPedidoItemUtente(item);

  const nome = utente.nome || emptyValue;
  const numero9 = utente.numero9 || emptyValue;

  return `${nome}${separator}${numero9}`;
}

export function getSantaCasaPedidoItemsCount(pedido) {
  return getSantaCasaPedidoItems(pedido).length;
}

export function getSantaCasaPedidoTotalQuantity(pedido) {
  return getSantaCasaPedidoItems(pedido).reduce((total, item) => {
    return total + getSantaCasaPedidoItemQuantity(item);
  }, 0);
}

export function getSantaCasaPedidoUtentes(pedido) {
  const utentesByKey = new Map();

  getSantaCasaPedidoItems(pedido).forEach((item) => {
    const utente = getSantaCasaPedidoItemUtente(item);
    const key = getSantaCasaPedidoItemUtenteKey(item);

    if (!key || utentesByKey.has(key)) return;

    utentesByKey.set(key, utente);
  });

  return Array.from(utentesByKey.values()).sort((firstUtente, secondUtente) => {
    const nameComparison = collator.compare(
      firstUtente.nome,
      secondUtente.nome,
    );

    if (nameComparison !== 0) {
      return nameComparison;
    }

    return collator.compare(firstUtente.numero9, secondUtente.numero9);
  });
}

export function getSantaCasaPedidoUtentesCount(pedido) {
  return getSantaCasaPedidoUtentes(pedido).length;
}

export function compareSantaCasaPedidoItems(firstItem, secondItem) {
  const typeComparison = collator.compare(
    firstItem?.tipo || "",
    secondItem?.tipo || "",
  );

  if (typeComparison !== 0) {
    return typeComparison;
  }

  return collator.compare(
    getSantaCasaPedidoItemMedicationLabel(firstItem),
    getSantaCasaPedidoItemMedicationLabel(secondItem),
  );
}

export function groupSantaCasaPedidoItemsByUtente(
  items = [],
  {
    sortItems = compareSantaCasaPedidoItems,

    utenteFallback = SANTACASA_PEDIDO_UI.labels.utenteFallback,

    emptyValue = SANTACASA_PEDIDO_UI.labels.emptyValue,
  } = {},
) {
  const groupsByUtente = new Map();

  items.filter(Boolean).forEach((item) => {
    const utente = getSantaCasaPedidoItemUtente(item);
    const key = getSantaCasaPedidoItemUtenteKey(item);

    if (!groupsByUtente.has(key)) {
      groupsByUtente.set(key, {
        utenteId: utente.id || key,
        utenteNome: utente.nome || utenteFallback,
        utenteNumero9: utente.numero9 || emptyValue,
        items: [],
      });
    }

    groupsByUtente.get(key).items.push(item);
  });

  return Array.from(groupsByUtente.values())
    .map((group) => ({
      ...group,
      items:
        typeof sortItems === "function"
          ? [...group.items].sort(sortItems)
          : [...group.items],
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

export function getSantaCasaPedidoItemReceita(item) {
  if (item?.tipo !== SANTACASA_PEDIDO_ITEM_TYPES.receita) {
    return null;
  }

  const receitaLinha = item?.receitaLinha || item?.source?.receitaLinha;

  const receita =
    receitaLinha?.receita || item?.receita || item?.source?.receita || null;

  if (receita || receitaLinha) {
    return {
      ...(receita || {}),

      validade:
        receitaLinha?.validade ||
        receita?.validade ||
        item?.validade ||
        item?.source?.validade ||
        "",
    };
  }

  if (item?.numero19 || item?.pinAcesso6 || item?.pinOpcao4) {
    return {
      numero19: item.numero19,
      pinAcesso6: item.pinAcesso6,
      pinOpcao4: item.pinOpcao4,
      validade: item.validade || "",
    };
  }

  return null;
}

export function hasSantaCasaPedidoReceitaBarcodeData(receita) {
  return Boolean(
    receita?.numero19 || receita?.pinAcesso6 || receita?.pinOpcao4,
  );
}

export function getSantaCasaPedidoReceitaBarcodeCodes(
  receita = {},
  {
    receitaNumberLabel = "N.º receita",
    pinAcessoLabel = "PIN acesso",
    pinOpcaoLabel = "PIN opção",
  } = {},
) {
  return [
    {
      key: "numero19",
      label: receitaNumberLabel,
      value: receita?.numero19,
      width: 0.72,
    },
    {
      key: "pinAcesso6",
      label: pinAcessoLabel,
      value: receita?.pinAcesso6,
      width: 1.08,
    },
    {
      key: "pinOpcao4",
      label: pinOpcaoLabel,
      value: receita?.pinOpcao4,
      width: 1.16,
    },
  ].filter((code) => code.value);
}

export function getSantaCasaPedidoReceitaValidityLabel(receita = {}) {
  return formatPedidoDate(receita?.validade);
}
