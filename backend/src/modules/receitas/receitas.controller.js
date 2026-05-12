// src/modules/receitas/receitas.controller.js
const service = require("./receitas.service");
const { ok, created, noContent } = require("../../shared/utils/http");

async function list(req, res) {
  const data = await service.listByUtente(req.params.utenteId);

  return ok(res, { data });
}

async function create(req, res) {
  const data = await service.createForUtente(req.params.utenteId, req.body);

  return created(res, { data });
}

async function removeLinha(req, res) {
  await service.removeLinhaForUtente(req.params.utenteId, req.params.linhaId);

  return noContent(res);
}

module.exports = {
  list,
  create,
  removeLinha,
};
