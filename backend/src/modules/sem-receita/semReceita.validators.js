// src/modules/sem-receita/semReceita.validators.js
const { badRequest } = require("../../shared/errors/AppError");

function validateCreateSemReceitaPayload(payload = {}) {
  const medicamento = String(payload.medicamento || payload.nome || "").trim();
  const quantidade = Math.floor(Number(payload.quantidade));

  if (!medicamento) {
    throw badRequest("O campo 'medicamento' é obrigatório.");
  }

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw badRequest(
      "O campo 'quantidade' deve ser um número inteiro maior que 0.",
    );
  }

  return {
    medicamento,
    quantidade,
  };
}

module.exports = {
  validateCreateSemReceitaPayload,
};
