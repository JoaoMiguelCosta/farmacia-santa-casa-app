// src/modules/extras/extras.controller.js
const service = require("./extras.service");
const { ok, created, noContent } = require("../../shared/utils/http");

async function list(req, res) {
  const data = await service.listByUtente(req.params.utenteId);

  return ok(res, { data });
}

async function create(req, res) {
  const data = await service.createForUtente(req.params.utenteId, req.body);

  return created(res, { data });
}

async function remove(req, res) {
  await service.removeForUtente(req.params.utenteId, req.params.extraId);

  return noContent(res);
}

module.exports = {
  list,
  create,
  remove,
};
