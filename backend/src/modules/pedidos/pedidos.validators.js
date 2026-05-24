// src/modules/pedidos/pedidos.validators.js
const { badRequest } = require("../../shared/errors/AppError");

const KIND_MAP = Object.freeze({
  COM_RECEITA: "COM_RECEITA",
  RECEITA: "COM_RECEITA",
  RECEITA_LINHA: "COM_RECEITA",
  SEM_RECEITA: "SEM_RECEITA",
  EXTRA: "EXTRA",
});

const HISTORICO_STATUS = new Set([
  "TODOS",
  "VALIDADO",
  "REJEITADO",
  "CANCELADO",
]);

const DEFAULT_CANCEL_REASON =
  "Cancelado pela Santa Casa antes da validação pela Farmácia.";

const MAX_CANCEL_REASON_LENGTH = 240;

function normalizeTipo(value) {
  const tipo = String(value || "")
    .trim()
    .toUpperCase();

  return KIND_MAP[tipo] || null;
}

function getItemId(raw = {}, tipo) {
  if (raw.id) return String(raw.id).trim();

  if (tipo === "COM_RECEITA") {
    return String(raw.linhaId || raw.receitaLinhaId || "").trim();
  }

  if (tipo === "SEM_RECEITA") {
    return String(raw.semReceitaId || "").trim();
  }

  if (tipo === "EXTRA") {
    return String(raw.extraId || "").trim();
  }

  return "";
}

function parsePedidoItem(raw = {}, index) {
  const utenteId = String(raw.utenteId || "").trim();
  const tipo = normalizeTipo(raw.tipo || raw.kind);
  const quantidade = Math.floor(Number(raw.quantidade ?? raw.qtd ?? 1));
  const id = getItemId(raw, tipo);

  if (!utenteId) {
    throw badRequest(`Item ${index + 1}: o campo 'utenteId' é obrigatório.`);
  }

  if (!tipo) {
    throw badRequest(`Item ${index + 1}: tipo de item inválido.`);
  }

  if (!id) {
    throw badRequest(`Item ${index + 1}: o campo 'id' é obrigatório.`);
  }

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw badRequest(
      `Item ${index + 1}: a quantidade deve ser um número inteiro maior que 0.`,
    );
  }

  return {
    utenteId,
    tipo,
    id,
    quantidade,
  };
}

function getPedidoItemKey(item) {
  return `${item.utenteId}:${item.tipo}:${item.id}`;
}

function mergeDuplicatePedidoItems(items = []) {
  const itemMap = new Map();

  items.forEach((item) => {
    const key = getPedidoItemKey(item);
    const existingItem = itemMap.get(key);

    if (!existingItem) {
      itemMap.set(key, { ...item });
      return;
    }

    itemMap.set(key, {
      ...existingItem,
      quantidade: existingItem.quantidade + item.quantidade,
    });
  });

  return Array.from(itemMap.values());
}

function validateCreatePedidoPayload(payload = {}) {
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (items.length === 0) {
    throw badRequest("O pedido deve conter pelo menos um item.");
  }

  const parsedItems = items.map(parsePedidoItem);

  return {
    items: mergeDuplicatePedidoItems(parsedItems),
  };
}

function parseIntegerQueryParam(value, fieldName, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed)) {
    throw badRequest(`O parâmetro '${fieldName}' deve ser um número válido.`);
  }

  return parsed;
}

function parseDateParam(value, fieldName, mode = "start") {
  const rawValue = String(value || "").trim();

  if (!rawValue) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawValue);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch.map(Number);

    return mode === "end"
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const parsed = new Date(rawValue);

  if (Number.isNaN(parsed.getTime())) {
    throw badRequest(`O parâmetro '${fieldName}' deve ser uma data válida.`);
  }

  return parsed;
}

function parseHistoricoStatus(value) {
  const status = String(value || "")
    .trim()
    .toUpperCase();

  if (!status || status === "TODOS" || status === "ALL") {
    return null;
  }

  if (!HISTORICO_STATUS.has(status)) {
    throw badRequest(
      "O filtro 'status' deve ser TODOS, VALIDADO, REJEITADO ou CANCELADO.",
    );
  }

  return status;
}

function parseHistoricoQuery(query = {}) {
  const skip = Math.max(0, parseIntegerQueryParam(query.skip, "skip", 0));

  const rawTake = parseIntegerQueryParam(query.take, "take", 50);
  const take = Math.min(Math.max(1, rawTake), 200);

  return {
    status: parseHistoricoStatus(query.status),
    from: parseDateParam(query.from, "from", "start"),
    to: parseDateParam(query.to, "to", "end"),
    search: query.search ? String(query.search).trim() : "",
    skip,
    take,
  };
}

function parseCancelPedidoPayload(body = {}) {
  const reason = String(body.reason || body.motivo || "").trim();

  if (reason.length > MAX_CANCEL_REASON_LENGTH) {
    throw badRequest(
      `O motivo do cancelamento não pode exceder ${MAX_CANCEL_REASON_LENGTH} caracteres.`,
    );
  }

  return {
    reason: reason || DEFAULT_CANCEL_REASON,
  };
}

function parsePendentesQuery(query = {}) {
  const skip = Math.max(0, parseIntegerQueryParam(query.skip, "skip", 0));

  const rawTake = parseIntegerQueryParam(query.take, "take", 50);
  const take = Math.min(Math.max(1, rawTake), 200);

  return {
    search: query.search ? String(query.search).trim() : "",
    skip,
    take,
  };
}

module.exports = {
  validateCreatePedidoPayload,
  parseHistoricoQuery,
  parseCancelPedidoPayload,
  parsePendentesQuery,
};
