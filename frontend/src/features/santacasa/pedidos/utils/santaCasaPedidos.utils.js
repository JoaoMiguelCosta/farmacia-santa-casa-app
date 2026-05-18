export function clampQuantity(value, max) {
  const quantity = Math.floor(Number(value));
  const maxQuantity = Math.floor(Number(max));

  if (!Number.isFinite(maxQuantity) || maxQuantity <= 0) return 0;
  if (!Number.isFinite(quantity) || quantity <= 0) return 1;

  return Math.min(quantity, maxQuantity);
}

export function formatUnitsLabel(quantity) {
  const amount = Number(quantity) || 0;

  return amount === 1 ? "1 unidade" : `${amount} unidades`;
}

export function normalizeMedicationName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getItemMedicationName(item) {
  return (
    item?.medicamento ||
    item?.nome ||
    item?.title ||
    item?.source?.medicamento ||
    item?.source?.nome ||
    ""
  );
}

export function isSameMedication(a, b) {
  return (
    normalizeMedicationName(getItemMedicationName(a)) ===
    normalizeMedicationName(getItemMedicationName(b))
  );
}

export function buildPedidoPayload(items = []) {
  return {
    items: items.map((item) => ({
      utenteId: item.utenteId,
      tipo: item.tipo,
      id: item.id,
      quantidade: Number(item.quantidade),
    })),
  };
}

export function buildRemoveMessage(item, quantity) {
  return `${formatUnitsLabel(quantity)} de ${getItemMedicationName(
    item,
  )} retiradas do pedido geral. A quantidade voltou a ficar disponível na lista correspondente.`;
}

export function buildRemoveAllMessage(item) {
  return `${getItemMedicationName(
    item,
  )} removido do pedido geral. A quantidade voltou a ficar disponível na lista correspondente.`;
}
