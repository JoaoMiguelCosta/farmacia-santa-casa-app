// src/modules/regularizacoes/regularizacoes.service.js
const repository = require("./regularizacoes.repository");

const { parseRegularizacoesQuery } = require("./regularizacoes.validators");

const { toRegularizacoesPageDTO } = require("./regularizacoes.mappers");

async function listPendentes(query = {}) {
  const params = parseRegularizacoesQuery(query);
  const result = await repository.listPendentes(params);

  return toRegularizacoesPageDTO(result);
}

async function listHistorico(query = {}) {
  const params = parseRegularizacoesQuery(query);
  const result = await repository.listHistorico(params);

  return toRegularizacoesPageDTO(result);
}

async function getSignal() {
  return repository.getSignal();
}

module.exports = {
  listPendentes,
  listHistorico,
  getSignal,
};
