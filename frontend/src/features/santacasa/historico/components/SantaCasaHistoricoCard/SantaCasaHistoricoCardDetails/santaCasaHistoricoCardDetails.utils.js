// src/features/santacasa/historico/components/SantaCasaHistoricoCard/santaCasaHistoricoCardDetails.utils.js

import { SANTACASA_HISTORICO_PAGE } from "../../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoItemMedicamentoLabel,
  getHistoricoPedidoItemQuantityLabel,
  getHistoricoPedidoItemStatusLabel,
  getHistoricoPedidoItemTypeLabel,
  getHistoricoPedidoItemUtenteLabel,
} from "../../../utils/santaCasaHistoricoItems.utils";

import { isHistoricoPedidoItemDanger } from "../SantaCasaHistoricoItem/santaCasaHistoricoItem.utils";

const UNIDENTIFIED_UTENTE_KEY = "utente-sem-identificacao";

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("pt-PT");
}

function getComparableText(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSafeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items;
}

function getSafeQuantity(value) {
  const numberValue = Number(value);

  if (Number.isFinite(numberValue)) {
    return numberValue;
  }

  return 0;
}

function getItemQuantity(item) {
  const directQuantity = getSafeQuantity(item?.quantidade);

  if (directQuantity > 0) {
    return directQuantity;
  }

  return getSafeQuantity(getHistoricoPedidoItemQuantityLabel(item));
}

function getItemTypePriority(tipo) {
  if (tipo === "COM_RECEITA") {
    return 1;
  }

  if (tipo === "EXTRA") {
    return 2;
  }

  if (tipo === "SEM_RECEITA") {
    return 3;
  }

  return 9;
}

function getItemStatusPriority(item) {
  if (isHistoricoPedidoItemDanger(item)) {
    return 1;
  }

  if (item?.status === "PENDENTE") {
    return 2;
  }

  if (item?.status === "VALIDADO") {
    return 3;
  }

  return 9;
}

function compareText(firstValue, secondValue) {
  return getComparableText(firstValue).localeCompare(
    getComparableText(secondValue),
    "pt-PT",
  );
}

function sortHistoricoItems(items) {
  return [...items].sort((firstItem, secondItem) => {
    const statusDifference =
      getItemStatusPriority(firstItem) - getItemStatusPriority(secondItem);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    const typeDifference =
      getItemTypePriority(firstItem?.tipo) -
      getItemTypePriority(secondItem?.tipo);

    if (typeDifference !== 0) {
      return typeDifference;
    }

    const nameDifference = compareText(
      getHistoricoPedidoItemMedicamentoLabel(firstItem),
      getHistoricoPedidoItemMedicamentoLabel(secondItem),
    );

    if (nameDifference !== 0) {
      return nameDifference;
    }

    return getItemQuantity(secondItem) - getItemQuantity(firstItem);
  });
}

function hasIdentifiedUtente(item) {
  return Boolean(
    item?.utenteId ||
      item?.utente?.id ||
      item?.utente?.nome ||
      item?.utente?.numero9 ||
      item?.utente?.numero ||
      item?.utente?.numeroUtente,
  );
}

function getItemUtenteKey(item) {
  return (
    item?.utenteId ||
    item?.utente?.id ||
    item?.utente?.numero9 ||
    item?.utente?.numero ||
    item?.utente?.numeroUtente ||
    UNIDENTIFIED_UTENTE_KEY
  );
}

function getItemUtenteLabel(item) {
  if (!hasIdentifiedUtente(item)) {
    return SANTACASA_HISTORICO_PAGE.labels.unidentifiedUtente;
  }

  return getHistoricoPedidoItemUtenteLabel(item);
}

function createEmptyGroup(item) {
  return {
    key: String(getItemUtenteKey(item)),
    utenteLabel: getItemUtenteLabel(item),
    items: [],
    totalItems: 0,
    totalQuantity: 0,
    warningItems: 0,
  };
}

function getPluralLabel(value, singular, plural) {
  return Number(value) === 1 ? singular : plural;
}

function getGroupSummary(group) {
  const labels = SANTACASA_HISTORICO_PAGE.labels;

  const medicinesLabel = getPluralLabel(
    group.totalItems,
    labels.medicamentoSingular,
    labels.medicamentoPlural,
  );

  const unitsLabel = getPluralLabel(
    group.totalQuantity,
    labels.unidadeSingular,
    labels.unidadePlural,
  );

  const summaryParts = [
    `${group.totalItems} ${medicinesLabel}`,
    `${group.totalQuantity} ${unitsLabel}`,
  ];

  if (group.warningItems > 0) {
    const warningsLabel = getPluralLabel(
      group.warningItems,
      labels.warningSingular,
      labels.warningPlural,
    );

    summaryParts.push(`${group.warningItems} ${warningsLabel}`);
  }

  return summaryParts.join(" · ");
}

function sortHistoricoGroups(groups) {
  return [...groups].sort((firstGroup, secondGroup) => {
    const warningDifference =
      secondGroup.warningItems - firstGroup.warningItems;

    if (warningDifference !== 0) {
      return warningDifference;
    }

    const itemsDifference = secondGroup.totalItems - firstGroup.totalItems;

    if (itemsDifference !== 0) {
      return itemsDifference;
    }

    return compareText(firstGroup.utenteLabel, secondGroup.utenteLabel);
  });
}

function getReceitaSearchValues(item) {
  const receita = item?.receitaLinha?.receita;

  if (!receita) {
    return [];
  }

  return [receita.numero19, receita.pinAcesso6, receita.pinOpcao4];
}

function getHistoricoPedidoItemSearchIndex(item) {
  return [
    getHistoricoPedidoItemUtenteLabel(item),
    item?.utente?.nome,
    item?.utente?.name,
    item?.utente?.numero9,
    item?.utente?.numero,
    item?.utente?.numeroUtente,

    getHistoricoPedidoItemMedicamentoLabel(item),
    item?.medicamento,
    item?.nome,

    getHistoricoPedidoItemTypeLabel(item?.tipo),
    getHistoricoPedidoItemStatusLabel(item?.status),

    item?.tipo,
    item?.status,

    item?.receitaLinha?.nome,
    item?.receitaLinha?.validade,

    ...getReceitaSearchValues(item),
  ]
    .filter(Boolean)
    .map(getComparableText)
    .join(" ");
}

function matchesHistoricoItemSearch(item, normalizedSearch) {
  if (!normalizedSearch) {
    return true;
  }

  return getHistoricoPedidoItemSearchIndex(item).includes(normalizedSearch);
}

export function filterHistoricoPedidoItems(items, search) {
  const safeItems = getSafeItems(items);
  const normalizedSearch = getComparableText(search);

  if (!normalizedSearch) {
    return safeItems;
  }

  return safeItems.filter((item) => {
    return matchesHistoricoItemSearch(item, normalizedSearch);
  });
}

export function getHistoricoPedidoItemGroups(items = []) {
  const groupsByUtente = new Map();

  getSafeItems(items).forEach((item) => {
    const key = String(getItemUtenteKey(item));

    if (!groupsByUtente.has(key)) {
      groupsByUtente.set(key, createEmptyGroup(item));
    }

    const group = groupsByUtente.get(key);

    group.items.push(item);
    group.totalItems += 1;
    group.totalQuantity += getItemQuantity(item);

    if (isHistoricoPedidoItemDanger(item)) {
      group.warningItems += 1;
    }
  });

  return sortHistoricoGroups(Array.from(groupsByUtente.values())).map(
    (group) => ({
      ...group,
      summary: getGroupSummary(group),
      items: sortHistoricoItems(group.items),
    }),
  );
}
