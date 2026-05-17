import { formatDateTime } from "../../../../../shared/utils/formatDate";
import { FARMACIA_PEDIDO_UI } from "../config/farmaciaPedidoUi.config";

const UNKNOWN_LABEL = "—";

export function getPedidoNumberLabel(pedido) {
  const numero = Number(pedido?.numero);

  if (!Number.isFinite(numero)) return UNKNOWN_LABEL;

  return `#${numero}`;
}

export function getPedidoStatusLabel(status) {
  return FARMACIA_PEDIDO_UI.status[status] || status || UNKNOWN_LABEL;
}

export function getPedidoItemStatusLabel(status) {
  return FARMACIA_PEDIDO_UI.itemStatus[status] || status || UNKNOWN_LABEL;
}

export function getPedidoItemTypeLabel(tipo) {
  return FARMACIA_PEDIDO_UI.itemTypes[tipo] || tipo || UNKNOWN_LABEL;
}

export function getPedidoCreatedAtLabel(pedido) {
  return formatDateTime(pedido?.createdAt);
}

export function getPedidoUpdatedAtLabel(pedido) {
  return formatDateTime(pedido?.updatedAt);
}

export function getPedidoValidatedAtLabel(pedido) {
  return formatDateTime(pedido?.validatedAt);
}

export function getPedidoRejectedAtLabel(pedido) {
  return formatDateTime(pedido?.rejectedAt);
}

export function getPedidoClosedAtLabel(pedido) {
  const closedAt =
    pedido?.validatedAt ||
    pedido?.rejectedAt ||
    pedido?.updatedAt ||
    pedido?.createdAt;

  return formatDateTime(closedAt);
}

export function getPedidoClosedReasonLabel(pedido) {
  const reason = String(pedido?.closedReason || "").trim();

  return reason || UNKNOWN_LABEL;
}

export function getPedidoClosedReasonTitle(pedido) {
  if (pedido?.status === "REJEITADO") {
    return FARMACIA_PEDIDO_UI.labels.rejectionReason;
  }

  return FARMACIA_PEDIDO_UI.labels.closedReason;
}

export function hasPedidoClosedReason(pedido) {
  return Boolean(String(pedido?.closedReason || "").trim());
}

export function getPedidoItems(pedido) {
  return Array.isArray(pedido?.itens) ? pedido.itens : [];
}

export function getPedidoItemsCount(pedido) {
  return getPedidoItems(pedido).length;
}

export function getPedidoTotalQuantity(pedido) {
  return getPedidoItems(pedido).reduce((total, item) => {
    return total + (Number(item?.quantidade) || 0);
  }, 0);
}

export function getPedidoUtentes(pedido) {
  const utentesMap = new Map();

  getPedidoItems(pedido).forEach((item) => {
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

export function getPedidoUtentesLabel(pedido) {
  const utentes = getPedidoUtentes(pedido);

  if (utentes.length === 0) return UNKNOWN_LABEL;

  return utentes
    .map((utente) => `${utente.nome} · ${utente.numero9}`)
    .join(", ");
}

export function getPedidoItemMedicamentoLabel(item) {
  return item?.medicamento || UNKNOWN_LABEL;
}

export function getPedidoItemQuantityLabel(item) {
  const quantidade = Number(item?.quantidade);

  if (!Number.isFinite(quantidade)) return UNKNOWN_LABEL;

  return String(quantidade);
}

export function getPedidoItemUtenteLabel(item) {
  const nome = item?.utente?.nome || UNKNOWN_LABEL;
  const numero9 = item?.utente?.numero9 || UNKNOWN_LABEL;

  return `${nome} · ${numero9}`;
}

export function getPedidoItemReferenceLabel(item) {
  if (!item) return UNKNOWN_LABEL;

  if (item.tipo === "COM_RECEITA") {
    const receita = item.receitaLinha?.receita;

    if (!receita?.numero19) return "Receita sem número";

    return `Receita ${receita.numero19}`;
  }

  if (item.tipo === "SEM_RECEITA") {
    return "Medicamento sem receita";
  }

  if (item.tipo === "EXTRA") {
    return "Extra por regularizar";
  }

  return UNKNOWN_LABEL;
}

export function getPedidoItemMetaLabel(item) {
  if (!item) return UNKNOWN_LABEL;

  if (item.tipo === "COM_RECEITA") {
    const receita = item.receitaLinha?.receita;

    if (!receita) return UNKNOWN_LABEL;

    return `PIN ${receita.pinAcesso6 || "—"} · Opção ${
      receita.pinOpcao4 || "—"
    }`;
  }

  if (item.tipo === "SEM_RECEITA") {
    const quantidade = Number(item.semReceita?.quantidade);

    if (!Number.isFinite(quantidade)) return UNKNOWN_LABEL;

    return `Disponível no registo: ${quantidade}`;
  }

  if (item.tipo === "EXTRA") {
    const quantidadeSolicitada = Number(item.extra?.quantidadeSolicitada) || 0;
    const quantidadeRegularizada =
      Number(item.extra?.quantidadeRegularizada) || 0;

    return `Solicitado ${quantidadeSolicitada} · Regularizado ${quantidadeRegularizada}`;
  }

  return UNKNOWN_LABEL;
}

export function buildRejectPedidoPayload(reason) {
  const motivo = String(reason || "").trim();

  return motivo ? { motivo } : {};
}

export function isPedidoPending(pedido) {
  return pedido?.status === "PENDENTE";
}
