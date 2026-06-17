// src/features/santacasa/pedidos/state/pedidoDraft.storage.js
const STORAGE_KEY = "farmacia-santa-casa:pedido-draft";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalizeStoredItem(item) {
  if (!item || typeof item !== "object") return null;

  const key = String(item.key || "").trim();
  const utenteId = String(item.utenteId || "").trim();
  const tipo = String(item.tipo || "").trim();
  const id = String(item.id || "").trim();

  const quantidade = Math.floor(Number(item.quantidade));
  const quantidadeRestante = Math.floor(Number(item.quantidadeRestante));

  if (!key || !utenteId || !tipo || !id) return null;
  if (!Number.isFinite(quantidade) || quantidade <= 0) return null;
  if (!Number.isFinite(quantidadeRestante) || quantidadeRestante <= 0) {
    return null;
  }

  return {
    key,
    utenteId,
    utenteNome: String(item.utenteNome || "Utente").trim(),
    utenteNumero9: String(item.utenteNumero9 || "").trim(),

    tipo,
    id,

    title: String(item.title || item.medicamento || "Medicamento").trim(),
    description: String(item.description || "").trim(),
    meta: String(item.meta || "").trim(),

    numero19: String(item.numero19 || item.source?.numero19 || "").trim(),
    pinAcesso6: String(item.pinAcesso6 || item.source?.pinAcesso6 || "").trim(),
    pinOpcao4: String(item.pinOpcao4 || item.source?.pinOpcao4 || "").trim(),
    validade: String(item.validade || item.source?.validade || "").trim(),

    quantidade: Math.min(quantidade, quantidadeRestante),
    quantidadeRestante,
  };
}

export function readPedidoDraftItems() {
  if (!canUseStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.map(normalizeStoredItem).filter(Boolean);
  } catch {
    return [];
  }
}

export function writePedidoDraftItems(items = []) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.map(normalizeStoredItem).filter(Boolean)),
    );
  } catch {
    // Evita rebentar a app se o browser bloquear localStorage.
  }
}

export function clearPedidoDraftItems() {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Evita rebentar a app se o browser bloquear localStorage.
  }
}
