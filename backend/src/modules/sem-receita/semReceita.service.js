// src/modules/sem-receita/semReceita.service.js
const semReceitaRepository = require("./semReceita.repository");
const utentesRepository = require("../utentes/utentes.repository");

const { toSemReceitaDTO } = require("./semReceita.mappers");
const { validateCreateSemReceitaPayload } = require("./semReceita.validators");

const { assertUtenteOperational } = require("../utentes/utentes.guards");

const {
  conflict,
  forbidden,
  notFound,
} = require("../../shared/errors/AppError");

async function ensureUtenteOperational(utenteId, actionLabel) {
  const utente = await utentesRepository.findById(utenteId);

  return assertUtenteOperational(utente, actionLabel);
}

async function listByUtente(utenteId) {
  await ensureUtenteOperational(
    utenteId,
    "consultar medicamentos sem receita deste utente",
  );

  const rows = await semReceitaRepository.findByUtente(utenteId);

  return rows
    .map(toSemReceitaDTO)
    .filter((item) => item.quantidadeRestante > 0);
}

async function createForUtente(utenteId, payload) {
  await ensureUtenteOperational(
    utenteId,
    "criar medicamento sem receita para este utente",
  );

  const data = validateCreateSemReceitaPayload(payload);

  const existing = await semReceitaRepository.findExistingByMedicamento(
    utenteId,
    data.medicamento,
  );

  if (existing) {
    const updated = await semReceitaRepository.incrementQuantidade(
      existing.id,
      data.quantidade,
    );

    return toSemReceitaDTO(updated);
  }

  const created = await semReceitaRepository.create(utenteId, data);

  return toSemReceitaDTO(created);
}

async function removeForUtente(utenteId, semReceitaId) {
  await ensureUtenteOperational(
    utenteId,
    "remover medicamento sem receita deste utente",
  );

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
