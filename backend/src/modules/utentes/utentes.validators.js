// src/modules/utentes/utentes.validators.js
const { badRequest } = require("../../shared/errors/AppError");

function validateCreateUtentePayload(payload = {}) {
  const numero9 = String(payload.numero9 || "").trim();
  const nome = String(payload.nome || "").trim();

  if (!/^\d{9}$/.test(numero9)) {
    throw badRequest("O campo 'numero9' deve ter exatamente 9 dígitos.");
  }

  if (!nome) {
    throw badRequest("O campo 'nome' é obrigatório.");
  }

  return {
    numero9,
    nome,
  };
}

module.exports = {
  validateCreateUtentePayload,
};
