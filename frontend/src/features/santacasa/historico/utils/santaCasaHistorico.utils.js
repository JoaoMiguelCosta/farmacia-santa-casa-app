import { formatDateTime } from "../../../../shared/utils/formatDate";
import { SANTACASA_HISTORICO_PAGE } from "../config/santaCasaHistoricoPage.config";

const UNKNOWN_LABEL = "—";

export function getHistoricoPedidoNumberLabel(pedido) {
  const numero = Number(pedido?.numero);

  if (!Number.isFinite(numero)) return UNKNOWN_LABEL;

  return `#${numero}`;
}

export function getHistoricoPedidoStatusLabel(status) {
  return SANTACASA_HISTORICO_PAGE.status[status] || status || UNKNOWN_LABEL;
}

export function getHistoricoPedidoVisualStatus(pedido) {
  if (isHistoricoPedidoValidadoComAvisos(pedido)) {
    return "VALIDADO_COM_AVISOS";
  }

  return pedido?.status || "";
}

export function getHistoricoPedidoVisualStatusLabel(pedido) {
  return getHistoricoPedidoStatusLabel(getHistoricoPedidoVisualStatus(pedido));
}

export function getHistoricoPedidoItemStatusLabel(status) {
  return SANTACASA_HISTORICO_PAGE.itemStatus[status] || status || UNKNOWN_LABEL;
}

export function getHistoricoPedidoItemTypeLabel(tipo) {
  return SANTACASA_HISTORICO_PAGE.itemTypes[tipo] || tipo || UNKNOWN_LABEL;
}

export function getHistoricoPedidoCreatedAtLabel(pedido) {
  return formatDateTime(pedido?.createdAt);
}

export function getHistoricoPedidoValidatedAtLabel(pedido) {
  return formatDateTime(pedido?.validatedAt);
}

export function getHistoricoPedidoRejectedAtLabel(pedido) {
  return formatDateTime(pedido?.rejectedAt);
}

export function getHistoricoPedidoClosedAtLabel(pedido) {
  const closedAt =
    pedido?.validatedAt ||
    pedido?.rejectedAt ||
    pedido?.updatedAt ||
    pedido?.createdAt;

  return formatDateTime(closedAt);
}

export function isHistoricoPedidoCancelado(pedido) {
  return pedido?.status === "CANCELADO";
}

export function getHistoricoPedidoItems(pedido) {
  return Array.isArray(pedido?.itens) ? pedido.itens : [];
}

export function isHistoricoPedidoItemCanceladoPorExpiracao(item) {
  return item?.status === "CANCELADO_POR_EXPIRACAO";
}

export function isHistoricoPedidoItemValidado(item) {
  return item?.status === "VALIDADO";
}

export function getHistoricoPedidoItensValidados(pedido) {
  return getHistoricoPedidoItems(pedido).filter(isHistoricoPedidoItemValidado);
}

export function getHistoricoPedidoItensCanceladosPorExpiracao(pedido) {
  return getHistoricoPedidoItems(pedido).filter(
    isHistoricoPedidoItemCanceladoPorExpiracao,
  );
}

export function getHistoricoPedidoValidatedItemsCount(pedido) {
  return getHistoricoPedidoItensValidados(pedido).length;
}

export function getHistoricoPedidoExpiredCanceledItemsCount(pedido) {
  return getHistoricoPedidoItensCanceladosPorExpiracao(pedido).length;
}

export function getHistoricoPedidoValidatedQuantity(pedido) {
  return getHistoricoPedidoItensValidados(pedido).reduce((total, item) => {
    return total + (Number(item?.quantidade) || 0);
  }, 0);
}

export function getHistoricoPedidoExpiredCanceledQuantity(pedido) {
  return getHistoricoPedidoItensCanceladosPorExpiracao(pedido).reduce(
    (total, item) => {
      return total + (Number(item?.quantidade) || 0);
    },
    0,
  );
}

export function hasHistoricoPedidoItensCanceladosPorExpiracao(pedido) {
  return getHistoricoPedidoItems(pedido).some(
    isHistoricoPedidoItemCanceladoPorExpiracao,
  );
}

export function isHistoricoPedidoValidadoComAvisos(pedido) {
  return (
    pedido?.status === "VALIDADO" &&
    hasHistoricoPedidoItensCanceladosPorExpiracao(pedido)
  );
}

export function isHistoricoPedidoCanceladoPorExpiracao(pedido) {
  if (!isHistoricoPedidoCancelado(pedido)) return false;

  const reason = String(pedido?.closedReason || pedido?.cancelReason || "")
    .trim()
    .toLowerCase();

  if (reason.includes("expiração") || reason.includes("expiracao")) {
    return true;
  }

  return getHistoricoPedidoItems(pedido).some(
    (item) => item?.status === "CANCELADO_POR_EXPIRACAO",
  );
}

export function isHistoricoPedidoCanceladoManualmente(pedido) {
  return (
    isHistoricoPedidoCancelado(pedido) &&
    !isHistoricoPedidoCanceladoPorExpiracao(pedido)
  );
}

export function isHistoricoPedidoItemCancelado(item) {
  return item?.status === "CANCELADO";
}

export function getHistoricoPedidoMessage(pedido) {
  if (isHistoricoPedidoValidadoComAvisos(pedido)) {
    return SANTACASA_HISTORICO_PAGE.messages.validatedWithWarnings;
  }

  if (pedido?.status === "VALIDADO") {
    return SANTACASA_HISTORICO_PAGE.messages.validated;
  }

  if (pedido?.status === "REJEITADO") {
    return SANTACASA_HISTORICO_PAGE.messages.rejected;
  }

  if (isHistoricoPedidoCanceladoPorExpiracao(pedido)) {
    return SANTACASA_HISTORICO_PAGE.messages.cancelledByExpiry;
  }

  if (isHistoricoPedidoCanceladoManualmente(pedido)) {
    return SANTACASA_HISTORICO_PAGE.messages.cancelledManually;
  }

  return "";
}

export function getHistoricoPedidoWarningNoticeTitle(pedido) {
  if (!isHistoricoPedidoValidadoComAvisos(pedido)) return "";

  return SANTACASA_HISTORICO_PAGE.labels.validatedWithWarningsNoticeTitle;
}

export function getHistoricoPedidoWarningNoticeMessage(pedido) {
  if (!isHistoricoPedidoValidadoComAvisos(pedido)) return "";

  return SANTACASA_HISTORICO_PAGE.messages.validatedWithWarningsNotice;
}

export function getHistoricoPedidoItemExpiryNoticeMessage(item) {
  if (!isHistoricoPedidoItemCanceladoPorExpiracao(item)) return "";

  return SANTACASA_HISTORICO_PAGE.messages.itemCancelledByExpiry;
}

export function getHistoricoPedidoCancellationNoticeTitle(pedido) {
  if (isHistoricoPedidoCanceladoPorExpiracao(pedido)) {
    return SANTACASA_HISTORICO_PAGE.labels.automaticCancellationNoticeTitle;
  }

  return SANTACASA_HISTORICO_PAGE.labels.manualCancellationNoticeTitle;
}

export function getHistoricoPedidoCancellationReleaseMessage(pedido) {
  if (isHistoricoPedidoCanceladoPorExpiracao(pedido)) {
    return SANTACASA_HISTORICO_PAGE.messages.cancelledByExpiryRelease;
  }

  return SANTACASA_HISTORICO_PAGE.messages.cancelledManuallyRelease;
}

export function getHistoricoPedidoClosedReasonTitle(pedido) {
  if (pedido?.status === "REJEITADO") {
    return SANTACASA_HISTORICO_PAGE.labels.rejectionReason;
  }

  if (pedido?.status === "CANCELADO") {
    return SANTACASA_HISTORICO_PAGE.labels.cancellationReason;
  }

  return SANTACASA_HISTORICO_PAGE.labels.closedReason;
}

export function getHistoricoPedidoClosedReasonLabel(pedido) {
  const reason = String(
    pedido?.closedReason || pedido?.cancelReason || "",
  ).trim();

  return reason || SANTACASA_HISTORICO_PAGE.messages.noReason;
}

export function hasHistoricoPedidoClosedReason(pedido) {
  return Boolean(
    String(pedido?.closedReason || pedido?.cancelReason || "").trim(),
  );
}

export function shouldShowHistoricoPedidoReason(pedido) {
  return ["REJEITADO", "CANCELADO"].includes(pedido?.status);
}

export function getHistoricoPedidoItemsCount(pedido) {
  return getHistoricoPedidoItems(pedido).length;
}

export function getHistoricoPedidoTotalQuantity(pedido) {
  return getHistoricoPedidoItems(pedido).reduce((total, item) => {
    return total + (Number(item?.quantidade) || 0);
  }, 0);
}

export function getHistoricoPedidoUtentes(pedido) {
  const utentesMap = new Map();

  getHistoricoPedidoItems(pedido).forEach((item) => {
    const utente = item?.utente;

    if (!utente?.id) return;

    utentesMap.set(utente.id, {
      id: utente.id,
      nome: utente.nome || UNKNOWN_LABEL,
      numero9: utente.numero9 || UNKNOWN_LABEL,
    });
  });

  return Array.from(utentesMap.values());
}

export function getHistoricoPedidoUtentesLabel(pedido) {
  const utentes = getHistoricoPedidoUtentes(pedido);

  if (utentes.length === 0) return UNKNOWN_LABEL;

  return utentes
    .map((utente) => `${utente.nome} · ${utente.numero9}`)
    .join(", ");
}

export function getHistoricoPedidoItemMedicamentoLabel(item) {
  return item?.medicamento || UNKNOWN_LABEL;
}

export function getHistoricoPedidoItemQuantityLabel(item) {
  const quantidade = Number(item?.quantidade);

  if (!Number.isFinite(quantidade)) return UNKNOWN_LABEL;

  return String(quantidade);
}

export function getHistoricoPedidoItemUtenteLabel(item) {
  const nome = item?.utente?.nome || UNKNOWN_LABEL;
  const numero9 = item?.utente?.numero9 || UNKNOWN_LABEL;

  return `${nome} · ${numero9}`;
}

export function getHistoricoPedidoItemReferenceLabel(item) {
  if (!item) return UNKNOWN_LABEL;

  if (item.tipo === "COM_RECEITA") {
    const receita = item.receitaLinha?.receita;

    if (!receita?.numero19) return "Receita sem número";

    return `Receita ${receita.numero19}`;
  }

  if (item.tipo === "SEM_RECEITA") {
    return SANTACASA_HISTORICO_PAGE.labels.semReceita;
  }

  if (item.tipo === "EXTRA") {
    return SANTACASA_HISTORICO_PAGE.labels.extra;
  }

  return UNKNOWN_LABEL;
}

export function getHistoricoPedidoItemMetaLabel(item) {
  if (!item) return UNKNOWN_LABEL;

  if (item.tipo === "COM_RECEITA") {
    const receita = item.receitaLinha?.receita;

    if (!receita) return UNKNOWN_LABEL;

    return `${SANTACASA_HISTORICO_PAGE.labels.pinAcesso}: ${
      receita.pinAcesso6 || "—"
    } · ${SANTACASA_HISTORICO_PAGE.labels.pinOpcao}: ${
      receita.pinOpcao4 || "—"
    }`;
  }

  if (item.tipo === "SEM_RECEITA") {
    const quantidade = Number(item.semReceita?.quantidade);

    if (!Number.isFinite(quantidade)) return UNKNOWN_LABEL;

    return `Quantidade no registo: ${quantidade}`;
  }

  if (item.tipo === "EXTRA") {
    const quantidadeSolicitada = Number(item.extra?.quantidadeSolicitada) || 0;
    const quantidadeRegularizada =
      Number(item.extra?.quantidadeRegularizada) || 0;

    return `Solicitado ${quantidadeSolicitada} · Regularizado ${quantidadeRegularizada}`;
  }

  return UNKNOWN_LABEL;
}

function normalizeDateInput(value, mode = "start") {
  const text = String(value || "").trim();

  if (!text) return "";

  const parts = text.split("-").map(Number);

  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return text;
  }

  const [year, month, day] = parts;

  const date =
    mode === "end"
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

  return date.toISOString();
}

export function buildSantaCasaHistoricoQuery({
  status = "TODOS",
  search = "",
  from = "",
  to = "",
  skip = 0,
  take = 50,
} = {}) {
  const normalizedStatus = String(status || "TODOS")
    .trim()
    .toUpperCase();

  const normalizedSearch = String(search || "").trim();

  return {
    status: normalizedStatus,
    search: normalizedSearch,
    from: normalizeDateInput(from, "start"),
    to: normalizeDateInput(to, "end"),
    skip,
    take,
  };
}
