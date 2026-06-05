import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoItemExpiryNoticeMessage,
  getHistoricoPedidoItemMedicamentoLabel,
  getHistoricoPedidoItemMetaLabel,
  getHistoricoPedidoItemQuantityLabel,
  getHistoricoPedidoItemReferenceLabel,
  getHistoricoPedidoItemStatusLabel,
  getHistoricoPedidoItemTypeLabel,
  getHistoricoPedidoItemUtenteLabel,
  isHistoricoPedidoItemCancelado,
  isHistoricoPedidoItemCanceladoPorExpiracao,
} from "../../utils/santaCasaHistorico.utils";

export function isHistoricoPedidoItemDanger(item) {
  return (
    item?.status === "REJEITADO" ||
    isHistoricoPedidoItemCanceladoPorExpiracao(item) ||
    isHistoricoPedidoItemCancelado(item)
  );
}

function getClassName(classNames) {
  return classNames.filter(Boolean).join(" ");
}

export function getHistoricoItemClassName(item, styles) {
  return getClassName([
    styles.item,
    isHistoricoPedidoItemDanger(item) ? styles.itemDanger : "",
  ]);
}

export function getHistoricoItemStatusClassName(item, styles) {
  return getClassName([
    styles.itemStatus,
    isHistoricoPedidoItemDanger(item) ? styles.itemStatusDanger : "",
  ]);
}

export function getHistoricoItemTypeClassName(tipo, styles) {
  const classNames = [styles.itemType];

  if (tipo === "COM_RECEITA") {
    classNames.push(styles.itemTypeReceita);
  }

  if (tipo === "SEM_RECEITA") {
    classNames.push(styles.itemTypeSemReceita);
  }

  if (tipo === "EXTRA") {
    classNames.push(styles.itemTypeVendaSuspensa);
  }

  return getClassName(classNames);
}

export function getHistoricoItemReceita(item) {
  if (item?.tipo !== "COM_RECEITA") return null;

  return item?.receitaLinha?.receita ?? null;
}

function formatHistoricoDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getHistoricoItemValidadeLabel(item) {
  const formattedDate = formatHistoricoDate(item?.receitaLinha?.validade);

  if (!formattedDate) return "";

  return `${SANTACASA_HISTORICO_PAGE.labels.validadeReceita}: ${formattedDate}`;
}

export function shouldShowHistoricoItemReference(item) {
  return item?.tipo === "EXTRA";
}

export function shouldShowHistoricoItemMeta(item) {
  return item?.tipo === "EXTRA";
}

export function getHistoricoItemViewModel(item, styles) {
  return {
    isDanger: isHistoricoPedidoItemDanger(item),

    itemClassName: getHistoricoItemClassName(item, styles),
    itemStatusClassName: getHistoricoItemStatusClassName(item, styles),
    itemTypeClassName: getHistoricoItemTypeClassName(item?.tipo, styles),

    typeLabel: getHistoricoPedidoItemTypeLabel(item?.tipo),
    statusLabel: getHistoricoPedidoItemStatusLabel(item?.status),
    medicamentoLabel: getHistoricoPedidoItemMedicamentoLabel(item),
    validadeLabel: getHistoricoItemValidadeLabel(item),
    quantityLabel: getHistoricoPedidoItemQuantityLabel(item),
    utenteLabel: getHistoricoPedidoItemUtenteLabel(item),
    referenceLabel: getHistoricoPedidoItemReferenceLabel(item),
    metaLabel: getHistoricoPedidoItemMetaLabel(item),
    expiryNotice: getHistoricoPedidoItemExpiryNoticeMessage(item),

    shouldShowReference: shouldShowHistoricoItemReference(item),
    shouldShowMeta: shouldShowHistoricoItemMeta(item),
  };
}
