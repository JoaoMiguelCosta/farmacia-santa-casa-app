const repository = require("./medicacaoHabitual.repository");
const utentesRepository = require("../utentes/utentes.repository");

const { toMedicacaoHabitualDTO } = require("./medicacaoHabitual.mappers");

const {
  validateCreateMedicacaoHabitualPayload,
} = require("./medicacaoHabitual.validators");

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
    "consultar a medicação habitual deste utente",
  );

  const rows = await repository.findByUtente(utenteId);

  return rows.map(toMedicacaoHabitualDTO);
}

async function createForUtente(utenteId, payload) {
  await ensureUtenteOperational(
    utenteId,
    "criar medicação habitual para este utente",
  );

  const data = validateCreateMedicacaoHabitualPayload(payload);

  const existing = await repository.findByUtenteAndNorm(
    utenteId,
    data.medicamentoNorm,
  );

  if (existing) {
    throw conflict("Este medicamento já existe na medicação habitual.");
  }

  const created = await repository.create(utenteId, data);

  return toMedicacaoHabitualDTO(created);
}

async function removeForUtente(utenteId, medicacaoId) {
  await ensureUtenteOperational(
    utenteId,
    "remover medicação habitual deste utente",
  );

  const row = await repository.findById(medicacaoId);

  if (!row) {
    throw notFound("Medicação habitual não encontrada.");
  }

  if (row.utenteId !== utenteId) {
    throw forbidden("Medicação habitual não pertence a este utente.");
  }

  await repository.deleteById(medicacaoId);
}

async function clearForUtente(utenteId) {
  await ensureUtenteOperational(
    utenteId,
    "remover a medicação habitual deste utente",
  );

  await repository.deleteManyByUtente(utenteId);
}

module.exports = {
  listByUtente,
  createForUtente,
  removeForUtente,
  clearForUtente,
};
