// src/modules/receitas/receitas.validators.js
const { badRequest } = require("../../shared/errors/AppError");
const { normalizeText } = require("../../shared/utils/normalize");

function assertDigits(value, length, fieldName) {
  const text = String(value || "").trim();
  const regex = new RegExp(`^\\d{${length}}$`);

  if (!regex.test(text)) {
    throw badRequest(
      `O campo '${fieldName}' deve ter exatamente ${length} dígitos.`,
    );
  }

  return text;
}

function parseBoolean(value) {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  return ["1", "true", "yes", "on", "sim"].includes(normalized);
}

function parseLinha(raw = {}, index) {
  const nome = String(raw.nome || raw.medicamento || "").trim();
  const quantidade = Math.floor(Number(raw.quantidade));
  const validade = raw.validade ? new Date(raw.validade) : null;

  if (!nome) {
    throw badRequest(`Linha ${index + 1}: o medicamento é obrigatório.`);
  }

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw badRequest(`Linha ${index + 1}: a quantidade deve ser maior que 0.`);
  }

  if (!(validade instanceof Date) || Number.isNaN(validade.getTime())) {
    throw badRequest(`Linha ${index + 1}: a validade é inválida.`);
  }

  if (validade <= new Date()) {
    throw badRequest(`Linha ${index + 1}: a validade deve ser futura.`);
  }

  return {
    nome,
    quantidade,
    validade,
    nomeNorm: normalizeText(nome),
  };
}

function validateCreateReceitaPayload(payload = {}) {
  const numero19 = assertDigits(payload.numero19, 19, "numero19");
  const pinAcesso6 = assertDigits(payload.pinAcesso6, 6, "pinAcesso6");
  const pinOpcao4 = assertDigits(payload.pinOpcao4, 4, "pinOpcao4");

  const rawLinhas = Array.isArray(payload.linhas) ? payload.linhas : [];

  if (rawLinhas.length === 0) {
    throw badRequest("Adicione pelo menos uma linha de medicamento.");
  }

  const linhas = rawLinhas.map(parseLinha);

  const seen = new Set();

  for (const linha of linhas) {
    if (seen.has(linha.nomeNorm)) {
      throw badRequest(
        "Não é permitido repetir o mesmo medicamento na mesma receita.",
      );
    }

    seen.add(linha.nomeNorm);
  }

  return {
    numero19,
    pinAcesso6,
    pinOpcao4,
    confirmRegularizacao: parseBoolean(payload.confirmRegularizacao),
    linhas: linhas.map(({ nome, quantidade, validade }) => ({
      nome,
      quantidade,
      validade,
    })),
  };
}

module.exports = {
  validateCreateReceitaPayload,
};
