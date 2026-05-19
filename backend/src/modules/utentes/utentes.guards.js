// src/modules/utentes/utentes.guards.js
const { conflict, notFound } = require("../../shared/errors/AppError");

function assertUtenteExists(utente) {
  if (!utente) {
    throw notFound("Utente não encontrado.");
  }

  return utente;
}

function assertUtenteNotDeleted(utente) {
  if (utente.deletedAt) {
    throw conflict("Utente já foi removido.");
  }

  return utente;
}

function getBlockedUtenteMessage(
  utente,
  actionLabel = "executar esta operação",
) {
  if (utente.status === "ARQUIVADO") {
    return `Não é possível ${actionLabel} porque o utente está arquivado.`;
  }

  return `Não é possível ${actionLabel} para este utente.`;
}

function assertUtenteOperational(
  utente,
  actionLabel = "executar esta operação",
) {
  assertUtenteExists(utente);
  assertUtenteNotDeleted(utente);

  if (utente.status !== "ATIVO") {
    throw conflict(getBlockedUtenteMessage(utente, actionLabel));
  }

  return utente;
}

function buildOpenDependenciesMessage(dependencies = {}) {
  const parts = [];

  if (dependencies.receitasAtivas > 0) {
    parts.push(`${dependencies.receitasAtivas} linha(s) de receita ativa`);
  }

  if (dependencies.semReceitaDisponivel > 0) {
    parts.push(
      `${dependencies.semReceitaDisponivel} medicamento(s) sem receita disponível`,
    );
  }

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

function hasOpenDependencies(dependencies = {}) {
  return Object.values(dependencies).some((count) => Number(count) > 0);
}

module.exports = {
  assertUtenteExists,
  assertUtenteNotDeleted,
  assertUtenteOperational,
  getBlockedUtenteMessage,
  buildOpenDependenciesMessage,
  hasOpenDependencies,
};
