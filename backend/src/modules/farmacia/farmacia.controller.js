// src/modules/farmacia/farmacia.controller.js
const service = require("./farmacia.service");
const { ok } = require("../../shared/utils/http");

async function listPedidos(req, res) {
  const data = await service.listPedidos(req.query);

  return ok(res, data);
}

async function validarPedido(req, res) {
  const data = await service.validarPedido(req.params.pedidoId, req.body);

  return ok(res, { data });
}

async function rejeitarPedido(req, res) {
  const data = await service.rejeitarPedido(req.params.pedidoId, req.body);

  return ok(res, { data });
}

async function getDashboardSignals(_req, res) {
  const data = await service.getDashboardSignals();

  return ok(res, data);
}

module.exports = {
  listPedidos,
  validarPedido,
  rejeitarPedido,
  getDashboardSignals,
};
