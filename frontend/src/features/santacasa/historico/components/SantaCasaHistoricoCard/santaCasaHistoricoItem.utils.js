// src/features/santacasa/historico/components/SantaCasaHistoricoCard/santaCasaHistoricoItem.utils.js

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoExtraMetaLabel,
  getHistoricoPedidoExtraReferenceLabel,
  getHistoricoPedidoItemExpiryNoticeMessage,
  getHistoricoPedidoItemMedicamentoLabel,
  getHistoricoPedidoItemQuantityLabel,
  getHistoricoPedidoItemStatusLabel,
  getHistoricoPedidoItemTypeLabel,
  getHistoricoPedidoItemUtenteLabel,
  isHistoricoPedidoItemCancelado,
  isHistoricoPedidoItemCanceladoPorExpiracao,
} from "../../utils/santaCasaHistoricoItems.utils";

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

function getHistoricoItemClassName(item, styles) {
  return getClassName([
    styles.item,
    isHistoricoPedidoItemDanger(item) ? styles.itemDanger : "",
  ]);
}

function getHistoricoItemStatusClassName(item, styles) {
  return getClassName([
    styles.itemStatus,
    isHistoricoPedidoItemDanger(item) ? styles.itemStatusDanger : "",
  ]);
}

function getHistoricoItemTypeClassName(tipo, styles) {
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
  if (item?.tipo !== "COM_RECEITA") {
    return null;
  }

  return item?.receitaLinha?.receita ?? null;
}

function formatHistoricoDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getHistoricoItemValidadeLabel(item) {
  const formattedDate = formatHistoricoDate(item?.receitaLinha?.validade);

  if (!formattedDate) {
    return "";
  }

  return `${SANTACASA_HISTORICO_PAGE.labels.validadeReceita}: ${formattedDate}`;
}

function shouldShowExtraDetails(item) {
  return item?.tipo === "EXTRA";
}

export function getHistoricoItemViewModel(item, styles) {
  const isDanger = isHistoricoPedidoItemDanger(item);
  const showExtraDetails = shouldShowExtraDetails(item);

  return {
    isDanger,
    showExtraDetails,

    itemClassName: getHistoricoItemClassName(item, styles),

    itemStatusClassName: getHistoricoItemStatusClassName(item, styles),

    itemTypeClassName: getHistoricoItemTypeClassName(item?.tipo, styles),

    typeLabel: getHistoricoPedidoItemTypeLabel(item?.tipo),

    statusLabel: getHistoricoPedidoItemStatusLabel(item?.status),

    medicamentoLabel: getHistoricoPedidoItemMedicamentoLabel(item),

    validadeLabel: getHistoricoItemValidadeLabel(item),

    quantityLabel: getHistoricoPedidoItemQuantityLabel(item),

    utenteLabel: getHistoricoPedidoItemUtenteLabel(item),

    referenceLabel: showExtraDetails
      ? getHistoricoPedidoExtraReferenceLabel(item)
      : "",

    metaLabel: showExtraDetails ? getHistoricoPedidoExtraMetaLabel(item) : "",

    expiryNotice: getHistoricoPedidoItemExpiryNoticeMessage(item),
  };
}
