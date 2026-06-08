// src/modules/farmacia/farmacia.controller.js
const service = require("./farmacia.service");
const { ok } = require("../../shared/utils/http");

async function listPedidos(req, res) {
  const data = await service.listPedidos(req.query);

  return ok(res, data);
}

async function getPedidoById(req, res) {
  const data = await service.getPedidoById(req.params.pedidoId);

  return ok(res, { data });
}

async function validarPedido(req, res) {
  const data = await service.validarPedido(req.params.pedidoId, req.body, {
    userId: req.user?.id,
  });

  return ok(res, { data });
}

async function rejeitarPedido(req, res) {
  const data = await service.rejeitarPedido(req.params.pedidoId, req.body, {
    userId: req.user?.id,
  });

  return ok(res, { data });
}

async function getDashboardSignals(_req, res) {
  const data = await service.getDashboardSignals();

  return ok(res, data);
}

module.exports = {
  listPedidos,
  getPedidoById,
  validarPedido,
  rejeitarPedido,
  getDashboardSignals,
};
