import { PEDIDOS_PAGE } from "../config/pedidosPage.config";

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

function getLocalDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isReceitaDraftItemExpired(item, now = new Date()) {
  if (item?.tipo !== "COM_RECEITA") return false;

  const validadeKey = getLocalDateKey(item?.validade);
  const todayKey = getLocalDateKey(now);

  if (!validadeKey || !todayKey) return false;

  return validadeKey < todayKey;
}

export function getExpiredReceitaDraftItems(items = [], now = new Date()) {
  return items.filter((item) => isReceitaDraftItemExpired(item, now));
}

function getExpiredItemsLabel(items = []) {
  return items
    .map(getItemMedicationName)
    .map((name) => name.trim())
    .filter(Boolean)
    .join(", ");
}

export function buildExpiredReceitasRemovedMessage(items = []) {
  const count = items.length;

  if (count === 0) return "";

  const medicamentos = getExpiredItemsLabel(items);

  if (count === 1) {
    return PEDIDOS_PAGE.feedback.expiredReceitaRemoved.replace(
      "{medicamento}",
      medicamentos || PEDIDOS_PAGE.labels.medicamentoFallback,
    );
  }

  return PEDIDOS_PAGE.feedback.expiredReceitasRemoved
    .replace("{count}", count)
    .replace("{medicamentos}", medicamentos);
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
