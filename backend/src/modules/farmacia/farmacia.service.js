// src/modules/farmacia/farmacia.service.js
const repository = require("./farmacia.repository");

const {
  parseListPedidosQuery,
  parseRejeitarPayload,
  parseValidarPayload,
} = require("./farmacia.validators");

const { unauthorized } = require("../../shared/errors/AppError");

const { toPedidoDTO, toPedidosPageDTO } = require("./farmacia.mappers");

function assertAuthenticatedUserId(userId) {
  if (!userId) {
    throw unauthorized("Utilizador autenticado em falta.");
  }

  return userId;
}

async function listPedidos(query = {}) {
  const params = parseListPedidosQuery(query);
  const result = await repository.listPedidos(params);

  return toPedidosPageDTO(result);
}

async function validarPedido(pedidoId, payload = {}, context = {}) {
  const userId = assertAuthenticatedUserId(context.userId);
  const params = parseValidarPayload(payload);

  const pedido = await repository.validarPedido(pedidoId, {
    ...params,
    validatedById: userId,
  });

  return toPedidoDTO(pedido);
}

async function rejeitarPedido(pedidoId, payload = {}, context = {}) {
  const userId = assertAuthenticatedUserId(context.userId);
  const params = parseRejeitarPayload(payload);

  const pedido = await repository.rejeitarPedido(pedidoId, {
    ...params,
    rejectedById: userId,
  });

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
