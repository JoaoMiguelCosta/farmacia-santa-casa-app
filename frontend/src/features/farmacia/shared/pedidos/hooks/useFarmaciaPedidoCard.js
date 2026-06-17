// src/features/farmacia/shared/pedidos/hooks/useFarmaciaPedidoCard.js
import { useMemo } from "react";

import { FARMACIA_PEDIDO_UI } from "../config/farmaciaPedidoUi.config";

import {
  buildPedidoOperationalSummary,
  getPedidoVisualStatus,
  getPedidoWarning,
} from "../utils/farmaciaPedidoOperational.utils";

import {
  getPedidoClosedAtLabel,
  getPedidoCreatedAtLabel,
  getPedidoUtenteGroups,
} from "../utils/farmaciaPedido.utils";

const AUDIT_FALLBACK = "—";

function getAuditUserLabel(user) {
  return user?.name || user?.email || AUDIT_FALLBACK;
}

function getPedidoAuditInfo(pedido) {
  const status = String(pedido?.status || "").toUpperCase();

  if (status === "VALIDADO") {
    return {
      label: "Validado por",
      value: getAuditUserLabel(pedido.validatedBy),
    };
  }

  if (status === "REJEITADO") {
    return {
      label: "Rejeitado por",
      value: getAuditUserLabel(pedido.rejectedBy),
    };
  }

  return null;
}

export function useFarmaciaPedidoCard({ pedido, variant = "pending" }) {
  const isHistory = variant === "history";

  const utenteGroups = useMemo(() => {
    return getPedidoUtenteGroups(pedido);
  }, [pedido]);

  const operationalSummary = useMemo(() => {
    return buildPedidoOperationalSummary(pedido);
  }, [pedido]);

  const visualStatus = useMemo(() => {
    return getPedidoVisualStatus(pedido, operationalSummary);
  }, [operationalSummary, pedido]);

  const warning = useMemo(() => {
    return getPedidoWarning(pedido, operationalSummary);
  }, [operationalSummary, pedido]);

  const auditInfo = isHistory ? getPedidoAuditInfo(pedido) : null;

  const dateLabel = isHistory
    ? FARMACIA_PEDIDO_UI.labels.closedAt
    : FARMACIA_PEDIDO_UI.labels.createdAt;

  const dateValue = isHistory
    ? getPedidoClosedAtLabel(pedido)
    : getPedidoCreatedAtLabel(pedido);

  return {
    utenteGroups,
    operationalSummary,
    visualStatus,
    warning,

    auditInfo,
    dateLabel,
    dateValue,
  };
}
