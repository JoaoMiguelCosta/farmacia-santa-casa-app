// src/modules/manutencao/manutencao.controller.js
const service = require("./manutencao.service");
const { ok } = require("../../shared/utils/http");

async function listJobs(_req, res) {
  const data = service.listJobs();

  return ok(res, data);
}

async function previewReceitaExpiry(_req, res) {
  const data = await service.previewReceitaExpiry();

  return ok(res, data);
}

async function runReceitaExpiry(_req, res) {
  const data = await service.runReceitaExpiry();

  return ok(res, data);
}

async function previewHigiene(req, res) {
  const data = await service.previewHigiene(req.query);

  return ok(res, data);
}

async function runHigiene(req, res) {
  const data = await service.runHigiene(req.body);

  return ok(res, data);
}

async function previewPurgeHistory(req, res) {
  const data = await service.previewPurgeHistory(req.query);

  return ok(res, data);
}

async function runPurgeHistory(req, res) {
  const data = await service.runPurgeHistory(req.body);

  return ok(res, data);
}

module.exports = {
  listJobs,
  previewReceitaExpiry,
  runReceitaExpiry,
  previewHigiene,
  runHigiene,
  previewPurgeHistory,
  runPurgeHistory,
};
