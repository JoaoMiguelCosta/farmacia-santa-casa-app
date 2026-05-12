// src/modules/extras/extras.service.js
const extrasRepository = require("./extras.repository");
const utentesRepository = require("../utentes/utentes.repository");

const { normalizeText } = require("../../shared/utils/normalize");

const { toExtraDTO, getReceitaLinhaRestanteDTO } = require("./extras.mappers");

const { validateCreateExtraPayload } = require("./extras.validators");

const {
  conflict,
  forbidden,
  notFound,
} = require("../../shared/errors/AppError");

async function ensureUtenteActive(utenteId) {
  const utente = await utentesRepository.findById(utenteId);

  if (!utente) {
    throw notFound("Utente não encontrado.");
  }

  if (utente.deletedAt) {
    throw conflict("Utente removido. Operação não permitida.");
  }

  return utente;
}

function getLinhaMedicamentoNorm(linha) {
  return normalizeText(linha.medicamentoRef?.nome || linha.nome);
}

function getExtraMedicamentoNorm(extra) {
  return normalizeText(extra.medicamentoRef?.nome || extra.medicamento);
}

async function listByUtente(utenteId) {
  await ensureUtenteActive(utenteId);

  const rows = await extrasRepository.findByUtente(utenteId);

  return rows.map(toExtraDTO).filter((extra) => extra.quantidadeRestante > 0);
}

async function createForUtente(utenteId, payload) {
  await ensureUtenteActive(utenteId);

  const data = validateCreateExtraPayload(payload);

  const receitaLinhas =
    await extrasRepository.findActiveReceitaLinhasByUtente(utenteId);

  const matchingReceitaLinha = receitaLinhas.find((linha) => {
    const sameMedicamento =
      getLinhaMedicamentoNorm(linha) === data.medicamentoNorm;

    if (!sameMedicamento) return false;

    return getReceitaLinhaRestanteDTO(linha) > 0;
  });

  if (matchingReceitaLinha) {
    throw conflict(
      "Já existe receita ativa com quantidade disponível para este medicamento.",
    );
  }

  const openExtras = await extrasRepository.findOpenExtrasByUtente(utenteId);

  const duplicatedExtra = openExtras.map(toExtraDTO).find((extra) => {
    const sameMedicamento =
      getExtraMedicamentoNorm(extra) === data.medicamentoNorm;

    return sameMedicamento && extra.quantidadeRestante > 0;
  });

  if (duplicatedExtra) {
    throw conflict("Já existe um Extra em aberto para este medicamento.");
  }

  const created = await extrasRepository.create(utenteId, data);

  return toExtraDTO(created);
}

async function removeForUtente(utenteId, extraId) {
  await ensureUtenteActive(utenteId);

  const extra = await extrasRepository.findById(extraId);

  if (!extra) {
    throw notFound("Extra não encontrado.");
  }

  if (extra.utenteId !== utenteId) {
    throw forbidden("Extra não pertence a este utente.");
  }

  const linkedPedidoItems =
    await extrasRepository.countPedidoItemsByExtra(extraId);

  if (linkedPedidoItems > 0) {
    throw conflict(
      "Não é possível remover: o Extra já está associado a pedidos.",
    );
  }

  await extrasRepository.deleteById(extraId);
}

module.exports = {
  listByUtente,
  createForUtente,
  removeForUtente,
};
