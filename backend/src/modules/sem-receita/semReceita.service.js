// src/modules/sem-receita/semReceita.service.js
const semReceitaRepository = require("./semReceita.repository");
const utentesRepository = require("../utentes/utentes.repository");

const { toSemReceitaDTO } = require("./semReceita.mappers");
const { validateCreateSemReceitaPayload } = require("./semReceita.validators");

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

async function listByUtente(utenteId) {
  await ensureUtenteActive(utenteId);

  const rows = await semReceitaRepository.findByUtente(utenteId);

  return rows
    .map(toSemReceitaDTO)
    .filter((item) => item.quantidadeRestante > 0);
}

async function createForUtente(utenteId, payload) {
  await ensureUtenteActive(utenteId);

  const data = validateCreateSemReceitaPayload(payload);

  const created = await semReceitaRepository.create(utenteId, data);

  return toSemReceitaDTO(created);
}

async function removeForUtente(utenteId, semReceitaId) {
  await ensureUtenteActive(utenteId);

  const row = await semReceitaRepository.findById(semReceitaId);

  if (!row) {
    throw notFound("Registo sem receita não encontrado.");
  }

  if (row.utenteId !== utenteId) {
    throw forbidden("Registo sem receita não pertence a este utente.");
  }

  const linkedPedidoItems =
    await semReceitaRepository.countPedidoItemsBySemReceita(semReceitaId);

  if (linkedPedidoItems > 0) {
    throw conflict(
      "Não é possível remover: o medicamento já está associado a pedidos.",
    );
  }

  await semReceitaRepository.deleteById(semReceitaId);
}

module.exports = {
  listByUtente,
  createForUtente,
  removeForUtente,
};
