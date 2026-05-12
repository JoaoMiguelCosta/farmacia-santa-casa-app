// src/modules/utentes/utentes.service.js
const repository = require("./utentes.repository");
const { toUtenteDTO } = require("./utentes.mappers");
const { validateCreateUtentePayload } = require("./utentes.validators");

const { conflict, notFound } = require("../../shared/errors/AppError");

async function listUtentes() {
  const rows = await repository.findAllActive();

  return rows.map(toUtenteDTO);
}

async function getUtenteById(id) {
  const utente = await repository.findById(id);

  if (!utente) {
    throw notFound("Utente não encontrado.");
  }

  return toUtenteDTO(utente);
}

async function createUtente(payload) {
  const data = validateCreateUtentePayload(payload);

  const [sameNumero9, sameNome] = await Promise.all([
    repository.findActiveByNumero9(data.numero9),
    repository.findActiveByNome(data.nome),
  ]);

  if (sameNumero9) {
    throw conflict("Já existe um utente ativo com esse número.");
  }

  if (sameNome) {
    throw conflict("Já existe um utente ativo com esse nome.");
  }

  const created = await repository.create(data);

  return toUtenteDTO(created);
}

function buildDependenciesMessage(dependencies) {
  const parts = [];

  if (dependencies.extras > 0) {
    parts.push(`${dependencies.extras} extra(s) em aberto`);
  }

  if (dependencies.regularizacoes > 0) {
    parts.push(`${dependencies.regularizacoes} regularização(ões) em aberto`);
  }

  if (dependencies.pedidosPendentes > 0) {
    parts.push(`${dependencies.pedidosPendentes} item(ns) de pedido pendente`);
  }

  return parts.join(", ");
}

async function removeUtente(id) {
  const utente = await repository.findById(id);

  if (!utente) {
    throw notFound("Utente não encontrado.");
  }

  if (utente.deletedAt) {
    throw conflict("Utente já foi removido.");
  }

  const dependencies = await repository.countOpenDependencies(id);

  const hasOpenDependencies =
    dependencies.extras > 0 ||
    dependencies.regularizacoes > 0 ||
    dependencies.pedidosPendentes > 0;

  if (hasOpenDependencies) {
    throw conflict(
      `Não é possível remover o utente: existem pendências (${buildDependenciesMessage(
        dependencies,
      )}).`,
    );
  }

  await repository.softDelete(id, "Removido sem pendências.");
}

module.exports = {
  listUtentes,
  getUtenteById,
  createUtente,
  removeUtente,
};
