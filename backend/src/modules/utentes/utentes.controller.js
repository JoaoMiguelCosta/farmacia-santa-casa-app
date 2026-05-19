// src/modules/utentes/utentes.controller.js
const service = require("./utentes.service");
const { ok, created, noContent } = require("../../shared/utils/http");

async function list(req, res) {
  const data = await service.listUtentes(req.query);

  return ok(res, { data });
}

async function getById(req, res) {
  const data = await service.getUtenteById(req.params.utenteId);

  return ok(res, { data });
}

async function create(req, res) {
  const data = await service.createUtente(req.body);

  return created(res, { data });
}

async function archive(req, res) {
  const data = await service.archiveUtente(req.params.utenteId, req.body, {
    currentUserId: req.user?.id,
  });

  return ok(res, { data });
}

async function reactivate(req, res) {
  const data = await service.reactivateUtente(req.params.utenteId);

  return ok(res, { data });
}

async function remove(req, res) {
  await service.removeUtente(req.params.utenteId);

  return noContent(res);
}

module.exports = {
  list,
  getById,
  create,
  archive,
  reactivate,
  remove,
};
