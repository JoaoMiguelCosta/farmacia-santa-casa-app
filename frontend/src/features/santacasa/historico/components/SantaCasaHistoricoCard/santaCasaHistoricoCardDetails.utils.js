import {
  getHistoricoPedidoItemMedicamentoLabel,
  getHistoricoPedidoItemQuantityLabel,
  getHistoricoPedidoItemStatusLabel,
  getHistoricoPedidoItemTypeLabel,
  getHistoricoPedidoItemUtenteLabel,
} from "../../utils/santaCasaHistorico.utils";

import { isHistoricoPedidoItemDanger } from "./santaCasaHistoricoItem.utils";

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

function getSafeQuantity(value) {
  const numberValue = Number(value);

  if (Number.isFinite(numberValue)) return numberValue;

  return 0;
}

function getItemQuantity(item) {
  const directQuantity = getSafeQuantity(item?.quantidade);

  if (directQuantity > 0) return directQuantity;

  return getSafeQuantity(getHistoricoPedidoItemQuantityLabel(item));
}

function getItemTypePriority(tipo) {
  if (tipo === "COM_RECEITA") return 1;
  if (tipo === "EXTRA") return 2;
  if (tipo === "SEM_RECEITA") return 3;

  return 9;
}

function getItemStatusPriority(item) {
  if (isHistoricoPedidoItemDanger(item)) return 1;

  if (item?.status === "PENDENTE") return 2;
  if (item?.status === "VALIDADO") return 3;

  return 9;
}

function compareText(a, b) {
  return getComparableText(a).localeCompare(getComparableText(b), "pt-PT");
}

function sortHistoricoItems(items) {
  return [...items].sort((firstItem, secondItem) => {
    const statusDifference =
      getItemStatusPriority(firstItem) - getItemStatusPriority(secondItem);

    if (statusDifference !== 0) return statusDifference;

    const typeDifference =
      getItemTypePriority(firstItem?.tipo) -
      getItemTypePriority(secondItem?.tipo);

    if (typeDifference !== 0) return typeDifference;

    const nameDifference = compareText(
      getHistoricoPedidoItemMedicamentoLabel(firstItem),
      getHistoricoPedidoItemMedicamentoLabel(secondItem),
    );

    if (nameDifference !== 0) return nameDifference;

    return getItemQuantity(secondItem) - getItemQuantity(firstItem);
  });
}

function getItemUtenteKey(item) {
  return (
    item?.utenteId ||
    item?.utente?.id ||
    item?.utente?.numero ||
    getHistoricoPedidoItemUtenteLabel(item) ||
    "utente-sem-identificacao"
  );
}

function getItemUtenteLabel(item) {
  return (
    getHistoricoPedidoItemUtenteLabel(item) ||
    item?.utente?.nome ||
    item?.utente?.name ||
    "Utente não identificado"
  );
}

function createEmptyGroup(item) {
  const utenteLabel = getItemUtenteLabel(item);

  return {
    key: String(getItemUtenteKey(item)),
    utenteLabel,
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
  const medicinesLabel = getPluralLabel(
    group.totalItems,
    "medicamento",
    "medicamentos",
  );

  const unitsLabel = getPluralLabel(group.totalQuantity, "unidade", "unidades");

  if (group.warningItems > 0) {
    const warningsLabel = getPluralLabel(group.warningItems, "aviso", "avisos");

    return `${group.totalItems} ${medicinesLabel} · ${group.totalQuantity} ${unitsLabel} · ${group.warningItems} ${warningsLabel}`;
  }

  return `${group.totalItems} ${medicinesLabel} · ${group.totalQuantity} ${unitsLabel}`;
}

function sortHistoricoGroups(groups) {
  return [...groups].sort((firstGroup, secondGroup) => {
    const warningDifference =
      secondGroup.warningItems - firstGroup.warningItems;

    if (warningDifference !== 0) return warningDifference;

    const itemsDifference = secondGroup.totalItems - firstGroup.totalItems;

    if (itemsDifference !== 0) return itemsDifference;

    return compareText(firstGroup.utenteLabel, secondGroup.utenteLabel);
  });
}

function getReceitaSearchValues(item) {
  const receita = item?.receitaLinha?.receita;

  if (!receita) return [];

  return [receita.numero19, receita.pinAcesso6, receita.pinOpcao4];
}

export function getHistoricoPedidoItemGroupsSearchIndex(item) {
  return [
    getHistoricoPedidoItemUtenteLabel(item),
    item?.utente?.nome,
    item?.utente?.name,
    item?.utente?.numero,

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

export function getHistoricoPedidoItemGroups(items = []) {
  const groupsByUtente = new Map();

  items.forEach((item) => {
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
