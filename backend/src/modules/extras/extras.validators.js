// src/modules/extras/extras.validators.js
const { badRequest } = require("../../shared/errors/AppError");
const { normalizeText } = require("../../shared/utils/normalize");

function normalizeReceitaDraftItems(items = []) {
  if (!Array.isArray(items)) return [];

  const groupedItems = new Map();

  items.forEach((item) => {
    const linhaId = String(item?.linhaId || item?.id || "").trim();
    const quantidade = Math.floor(Number(item?.quantidade));

    if (!linhaId) return;

    if (!Number.isFinite(quantidade) || quantidade <= 0) return;

    groupedItems.set(linhaId, (groupedItems.get(linhaId) || 0) + quantidade);
  });

  return Array.from(groupedItems.entries()).map(([linhaId, quantidade]) => ({
    linhaId,
    quantidade,
  }));
}

function validateCreateExtraPayload(payload = {}) {
  const medicamento = String(payload.medicamento || payload.nome || "").trim();

  const quantidadeSolicitada = Math.floor(
    Number(payload.quantidadeSolicitada ?? payload.quantidade),
  );

  if (!medicamento) {
    throw badRequest("O campo 'medicamento' é obrigatório.");
  }

  if (!Number.isFinite(quantidadeSolicitada) || quantidadeSolicitada <= 0) {
    throw badRequest(
      "O campo 'quantidadeSolicitada' deve ser um número inteiro maior que 0.",
    );
  }

  return {
    medicamento,
    medicamentoNorm: normalizeText(medicamento),
    quantidadeSolicitada,
    receitaDraftItems: normalizeReceitaDraftItems(payload.receitaDraftItems),
  };
}

module.exports = {
  validateCreateExtraPayload,
};
