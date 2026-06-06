// src/features/santacasa/historico/components/SantaCasaHistoricoCard/santaCasaHistoricoCardSummary.utils.js

import { SANTACASA_HISTORICO_PAGE } from "../../config/santaCasaHistoricoPage.config";

import {
  getHistoricoPedidoClosedAtLabel,
  getHistoricoPedidoExpiredCanceledItemsCount,
  getHistoricoPedidoExpiredCanceledQuantity,
  getHistoricoPedidoItems,
  getHistoricoPedidoItemsCount,
  getHistoricoPedidoTotalQuantity,
  getHistoricoPedidoUtentesLabel,
  getHistoricoPedidoValidatedItemsCount,
  getHistoricoPedidoValidatedQuantity,
  isHistoricoPedidoCanceladoPorExpiracao,
  isHistoricoPedidoValidadoComAvisos,
} from "../../utils/santaCasaHistorico.utils";

import { getHistoricoPedidoItemUtenteLabel } from "../../utils/santaCasaHistoricoItems.utils";

const MAX_VISIBLE_UTENTES = 2;

function getAuditUserLabel(user) {
  return (
    user?.name || user?.email || SANTACASA_HISTORICO_PAGE.labels.emptyValue
  );
}

function getItemUtenteKey(item) {
  return String(
    item?.utenteId ||
      item?.utente?.id ||
      item?.utente?.numero9 ||
      item?.utente?.numero ||
      item?.utente?.numeroUtente ||
      getHistoricoPedidoItemUtenteLabel(item) ||
      "",
  );
}

function getUniquePedidoUtentes(pedido) {
  const utentesByKey = new Map();

  getHistoricoPedidoItems(pedido).forEach((item) => {
    const key = getItemUtenteKey(item);
    const label = getHistoricoPedidoItemUtenteLabel(item);

    if (!key || !label || utentesByKey.has(key)) {
      return;
    }

    utentesByKey.set(key, label);
  });

  return Array.from(utentesByKey.values());
}

function getUtentesCountLabel(totalUtentes) {
  const labels = SANTACASA_HISTORICO_PAGE.labels;

  const utenteLabel = totalUtentes === 1 ? labels.utente : labels.utentes;

  return `${totalUtentes} ${utenteLabel.toLocaleLowerCase("pt-PT")}`;
}

function getPedidoUtentesSummaryInfo(pedido) {
  const utenteLabels = getUniquePedidoUtentes(pedido);
  const totalUtentes = utenteLabels.length;

  if (totalUtentes === 0) {
    return {
      key: "utentes",
      label: SANTACASA_HISTORICO_PAGE.labels.utente,
      value: getHistoricoPedidoUtentesLabel(pedido),
    };
  }

  const visibleUtentes = utenteLabels.slice(0, MAX_VISIBLE_UTENTES);

  const remainingUtentes = Math.max(totalUtentes - visibleUtentes.length, 0);

  return {
    key: "utentes",

    label:
      totalUtentes === 1
        ? SANTACASA_HISTORICO_PAGE.labels.utente
        : SANTACASA_HISTORICO_PAGE.labels.utentes,

    type: "utentes",

    value: {
      countLabel: getUtentesCountLabel(totalUtentes),
      visibleUtentes,
      remainingUtentes,
    },
  };
}

function getHistoricoPedidoDecisionDateLabel(pedido) {
  const status = String(pedido?.status || "").toUpperCase();

  if (status === "VALIDADO") {
    return SANTACASA_HISTORICO_PAGE.labels.validatedAt;
  }

  if (status === "REJEITADO") {
    return SANTACASA_HISTORICO_PAGE.labels.rejectedAt;
  }

  if (status === "CANCELADO") {
    return SANTACASA_HISTORICO_PAGE.labels.canceledAt;
  }

  return SANTACASA_HISTORICO_PAGE.labels.closedAt;
}

function getCanceledByLabel(pedido) {
  if (pedido?.canceledBy) {
    return getAuditUserLabel(pedido.canceledBy);
  }

  if (isHistoricoPedidoCanceladoPorExpiracao(pedido)) {
    return SANTACASA_HISTORICO_PAGE.labels.systemAutomatic;
  }

  return SANTACASA_HISTORICO_PAGE.labels.emptyValue;
}

function getPedidoAuditInfo(pedido) {
  const status = String(pedido?.status || "").toUpperCase();

  if (status === "VALIDADO") {
    return {
      key: "validatedBy",
      label: SANTACASA_HISTORICO_PAGE.labels.validatedBy,
      value: getAuditUserLabel(pedido?.validatedBy),
    };
  }

  if (status === "REJEITADO") {
    return {
      key: "rejectedBy",
      label: SANTACASA_HISTORICO_PAGE.labels.rejectedBy,
      value: getAuditUserLabel(pedido?.rejectedBy),
    };
  }

  if (status === "CANCELADO") {
    return {
      key: "canceledBy",
      label: SANTACASA_HISTORICO_PAGE.labels.canceledBy,
      value: getCanceledByLabel(pedido),
    };
  }

  return null;
}

export function getHistoricoPedidoSummaryItems(pedido) {
  const showWarningSummary = isHistoricoPedidoValidadoComAvisos(pedido);

  const auditInfo = getPedidoAuditInfo(pedido);
  const utentesInfo = getPedidoUtentesSummaryInfo(pedido);

  const summaryItems = [
    {
      key: "closedAt",
      label: getHistoricoPedidoDecisionDateLabel(pedido),
      value: getHistoricoPedidoClosedAtLabel(pedido),
    },
    utentesInfo,
    {
      key: "totalItems",
      label: SANTACASA_HISTORICO_PAGE.labels.totalItems,
      value: getHistoricoPedidoItemsCount(pedido),
    },
  ];

  if (showWarningSummary) {
    summaryItems.push(
      {
        key: "validatedItems",
        label: SANTACASA_HISTORICO_PAGE.labels.validatedItems,
        value: getHistoricoPedidoValidatedItemsCount(pedido),
      },
      {
        key: "expiredCanceledItems",
        label: SANTACASA_HISTORICO_PAGE.labels.expiredCanceledItems,
        value: getHistoricoPedidoExpiredCanceledItemsCount(pedido),
      },
      {
        key: "validatedQuantity",
        label: SANTACASA_HISTORICO_PAGE.labels.validatedQuantity,
        value: getHistoricoPedidoValidatedQuantity(pedido),
      },
      {
        key: "notValidatedQuantity",
        label: SANTACASA_HISTORICO_PAGE.labels.notValidatedQuantity,
        value: getHistoricoPedidoExpiredCanceledQuantity(pedido),
      },
    );
  } else {
    summaryItems.push({
      key: "totalQuantity",
      label: SANTACASA_HISTORICO_PAGE.labels.totalQuantity,
      value: getHistoricoPedidoTotalQuantity(pedido),
    });
  }

  if (auditInfo) {
    summaryItems.push(auditInfo);
  }

  return summaryItems;
}
