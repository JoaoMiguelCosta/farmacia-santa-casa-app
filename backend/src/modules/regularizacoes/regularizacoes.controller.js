// src/modules/regularizacoes/regularizacoes.controller.js
const service = require("./regularizacoes.service");
const { ok } = require("../../shared/utils/http");

async function listPendentes(req, res) {
  const data = await service.listPendentes(req.query);

  return ok(res, data);
}

async function listHistorico(req, res) {
  const data = await service.listHistorico(req.query);

  return ok(res, data);
}

async function getSignal(_req, res) {
  const data = await service.getSignal();

  return ok(res, data);
}

module.exports = {
  listPendentes,
  listHistorico,
  getSignal,
};
