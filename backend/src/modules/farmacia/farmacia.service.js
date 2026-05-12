// src/modules/farmacia/farmacia.service.js
const repository = require("./farmacia.repository");

const {
  parseListPedidosQuery,
  parseRejeitarPayload,
  parseValidarPayload,
} = require("./farmacia.validators");

const { toPedidoDTO, toPedidosPageDTO } = require("./farmacia.mappers");

async function listPedidos(query = {}) {
  const params = parseListPedidosQuery(query);
  const result = await repository.listPedidos(params);

  return toPedidosPageDTO(result);
}

async function validarPedido(pedidoId, payload = {}) {
  const params = parseValidarPayload(payload);
  const pedido = await repository.validarPedido(pedidoId, params);

  return toPedidoDTO(pedido);
}

async function rejeitarPedido(pedidoId, payload = {}) {
  const params = parseRejeitarPayload(payload);
  const pedido = await repository.rejeitarPedido(pedidoId, params);

  return toPedidoDTO(pedido);
}

async function getDashboardSignals() {
  return repository.getDashboardSignals();
}

module.exports = {
  listPedidos,
  validarPedido,
  rejeitarPedido,
  getDashboardSignals,
};
