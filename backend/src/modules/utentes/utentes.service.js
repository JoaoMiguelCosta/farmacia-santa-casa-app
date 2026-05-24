// src/modules/utentes/utentes.service.js
const repository = require("./utentes.repository");
const { toUtenteDTO } = require("./utentes.mappers");

const {
  parseListUtentesQuery,
  validateArchiveUtentePayload,
  validateCreateUtentePayload,
} = require("./utentes.validators");

const {
  assertUtenteExists,
  assertUtenteNotDeleted,
  buildOpenDependenciesMessage,
  hasOpenDependencies,
} = require("./utentes.guards");

const { conflict } = require("../../shared/errors/AppError");

function getDuplicateNumero9Message(utente) {
  if (utente.deletedAt) {
    return "Já existe um registo removido com esse número. Este número não pode ser reutilizado.";
  }

  if (utente.status === "ARQUIVADO") {
    return "Já existe um utente arquivado com esse número. Reativa o utente existente em vez de criar um novo registo.";
  }

  return "Já existe um utente ativo com esse número.";
}

function getDuplicateNomeMessage(utente) {
  if (utente.status === "ARQUIVADO") {
    return "Já existe um utente arquivado com esse nome. Confirma se deves reativar o registo existente em vez de criar um novo.";
  }

  return "Já existe um utente ativo com esse nome.";
}

async function listUtentes(query = {}) {
  const params = parseListUtentesQuery(query);
  const result = await repository.findPaginated(params);

  return {
    rows: result.rows.map(toUtenteDTO),
    total: result.total,
    params: {
      status: params.status,
      search: params.search,
      skip: result.skip,
      take: result.take,
    },
  };
}

async function getUtenteById(id) {
  const utente = await repository.findById(id);

  assertUtenteExists(utente);

  return toUtenteDTO(utente);
}

async function createUtente(payload) {
  const data = validateCreateUtentePayload(payload);

  const [sameNumero9, sameNome] = await Promise.all([
    repository.findByNumero9(data.numero9),
    repository.findNonDeletedByNome(data.nome),
  ]);

  if (sameNumero9) {
    throw conflict(getDuplicateNumero9Message(sameNumero9));
  }

  if (sameNome) {
    throw conflict(getDuplicateNomeMessage(sameNome));
  }

  const created = await repository.create(data);

  return toUtenteDTO(created);
}

async function assertCanArchiveUtente(id) {
  const dependencies = await repository.countOpenOperationalDependencies(id);

  if (hasOpenDependencies(dependencies)) {
    throw conflict(
      `Não é possível arquivar este utente porque existem pendências em aberto (${buildOpenDependenciesMessage(
        dependencies,
      )}). Resolve ou cancela as pendências antes de arquivar.`,
    );
  }
}

async function archiveUtente(id, payload = {}, context = {}) {
  const utente = await repository.findById(id);

  assertUtenteExists(utente);
  assertUtenteNotDeleted(utente);

  if (utente.status === "ARQUIVADO") {
    throw conflict("Utente já se encontra arquivado.");
  }

  await assertCanArchiveUtente(id);

  const params = validateArchiveUtentePayload(payload);

  const updated = await repository.archive(id, {
    archivedReason: params.archivedReason,
    archivedById: context.currentUserId || null,
  });

  return toUtenteDTO(updated);
}

async function reactivateUtente(id) {
  const utente = await repository.findById(id);

  assertUtenteExists(utente);
  assertUtenteNotDeleted(utente);

  if (utente.status === "ATIVO") {
    throw conflict("Utente já se encontra ativo.");
  }

  const updated = await repository.reactivate(id);

  return toUtenteDTO(updated);
}

function buildDeleteBlockingDependenciesMessage(dependencies) {
  const parts = [];

  if (dependencies.receitas > 0) {
    parts.push(`${dependencies.receitas} receita(s)`);
  }

  if (dependencies.receitaLinhas > 0) {
    parts.push(`${dependencies.receitaLinhas} linha(s) de receita`);
  }

  if (dependencies.semReceita > 0) {
    parts.push(
      `${dependencies.semReceita} medicamento(s) não sujeito(s) a receita médica`,
    );
  }

  if (dependencies.extras > 0) {
    parts.push(`${dependencies.extras} venda(s) suspensa(s)`);
  }

  if (dependencies.pedidoItens > 0) {
    parts.push(`${dependencies.pedidoItens} item(ns) de pedido`);
  }

  if (dependencies.regularizacoes > 0) {
    parts.push(`${dependencies.regularizacoes} regularização(ões)`);
  }

  if (dependencies.regularizacaoEventos > 0) {
    parts.push(
      `${dependencies.regularizacaoEventos} evento(s) de regularização`,
    );
  }

  if (dependencies.dispensas > 0) {
    parts.push(`${dependencies.dispensas} dispensa(s)`);
  }

  return parts.join(", ");
}

async function removeUtente(id) {
  const utente = await repository.findById(id);

  assertUtenteExists(utente);
  assertUtenteNotDeleted(utente);

  const dependencies = await repository.countDeleteBlockingDependencies(id);

  const hasBlockingDependencies = Object.values(dependencies).some(
    (count) => Number(count) > 0,
  );

  if (hasBlockingDependencies) {
    throw conflict(
      `Não é possível remover este utente porque já existem dados associados (${buildDeleteBlockingDependenciesMessage(
        dependencies,
      )}). Mantém o utente arquivado para preservar o histórico.`,
    );
  }

  await repository.softDelete(id, "Removido sem dados associados.");
}

module.exports = {
  listUtentes,
  getUtenteById,
  createUtente,
  archiveUtente,
  reactivateUtente,
  removeUtente,
};
