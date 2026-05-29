const { badRequest } = require("../../shared/errors/AppError");
const { normalizeText } = require("../../shared/utils/normalize");

const MAX_MEDICAMENTO_LENGTH = 160;

function validateCreateMedicacaoHabitualPayload(payload = {}) {
  const medicamento = String(payload.medicamento || payload.nome || "").trim();

  if (!medicamento) {
    throw badRequest("O campo 'medicamento' é obrigatório.");
  }

  if (medicamento.length > MAX_MEDICAMENTO_LENGTH) {
    throw badRequest(
      `O campo 'medicamento' não pode exceder ${MAX_MEDICAMENTO_LENGTH} caracteres.`,
    );
  }

  const medicamentoNorm = normalizeText(medicamento);

  if (!medicamentoNorm) {
    throw badRequest("O campo 'medicamento' é inválido.");
  }

  return {
    medicamento,
    medicamentoNorm,
  };
}

module.exports = {
  validateCreateMedicacaoHabitualPayload,
};
