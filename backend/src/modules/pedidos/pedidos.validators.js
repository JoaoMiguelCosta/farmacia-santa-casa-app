// src/modules/pedidos/pedidos.validators.js
const { badRequest } = require("../../shared/errors/AppError");

const KIND_MAP = Object.freeze({
  COM_RECEITA: "COM_RECEITA",
  RECEITA: "COM_RECEITA",
  RECEITA_LINHA: "COM_RECEITA",
  SEM_RECEITA: "SEM_RECEITA",
  EXTRA: "EXTRA",
});

const HISTORICO_STATUS = new Set(["VALIDADO", "REJEITADO"]);

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
    throw badRequest(
      `Item ${index + 1}: o campo 'tipo' deve ser COM_RECEITA, SEM_RECEITA ou EXTRA.`,
    );
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

function parseDateParam(value, fieldName) {
  if (!value) return null;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw badRequest(`O parâmetro '${fieldName}' deve ser uma data válida.`);
  }

  return parsed;
}

function parseHistoricoQuery(query = {}) {
  const status = String(query.status || "")
    .trim()
    .toUpperCase();

  const skip = Math.max(0, Number(query.skip || 0));
  const take = Math.min(Math.max(1, Number(query.take || 50)), 200);

  return {
    status: HISTORICO_STATUS.has(status) ? status : null,
    from: parseDateParam(query.from, "from"),
    to: parseDateParam(query.to, "to"),
    search: query.search ? String(query.search).trim() : "",
    skip,
    take,
  };
}

module.exports = {
  validateCreatePedidoPayload,
  parseHistoricoQuery,
};