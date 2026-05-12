// src/modules/pedidos/pedidos.controller.js
const service = require("./pedidos.service");
const { ok, created } = require("../../shared/utils/http");

async function create(req, res) {
  const data = await service.createPedido(req.body);

  return created(res, { data });
}

async function getById(req, res) {
  const data = await service.getPedidoById(req.params.pedidoId);

  return ok(res, { data });
}

async function listHistorico(req, res) {
  const data = await service.listHistorico(req.query);

  return ok(res, data);
}

module.exports = {
  create,
  getById,
  listHistorico,
};
