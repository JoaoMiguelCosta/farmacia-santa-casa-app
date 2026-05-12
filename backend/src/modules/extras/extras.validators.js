// src/modules/extras/extras.validators.js
const { badRequest } = require("../../shared/errors/AppError");
const { normalizeText } = require("../../shared/utils/normalize");

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
  };
}

module.exports = {
  validateCreateExtraPayload,
};
