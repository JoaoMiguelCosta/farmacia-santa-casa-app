export function canCancelPedido(pedido, operationalSummary) {
  return Boolean(
    pedido?.status === "PENDENTE" && operationalSummary?.pendingItems > 0,
  );
}

export function getSafeDomId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-");
}
